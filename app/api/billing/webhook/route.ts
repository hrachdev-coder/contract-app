import { NextResponse } from "next/server";
import {
  extractSubscriptionRecord,
  isLemonSqueezyWebhookConfigured,
  parseLemonSqueezyWebhook,
  verifyLemonSqueezySignature,
} from "@/lib/billing/lemonsqueezy";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isLemonSqueezyWebhookConfigured()) {
    return NextResponse.json(
      { message: "LemonSqueezy webhook secret is not configured." },
      { status: 503 }
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  if (!verifyLemonSqueezySignature(rawBody, signature)) {
    return NextResponse.json({ message: "Invalid webhook signature." }, { status: 401 });
  }

  const payload = parseLemonSqueezyWebhook(rawBody);
  const record = extractSubscriptionRecord(payload);

  if (!record) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const service = createServiceClient();

  let userId = record.userId;

  if (!userId) {
    const { data: existingSubscription } = await service
      .from("subscriptions")
      .select("user_id")
      .eq("lemon_squeezy_subscription_id", record.subscriptionId)
      .maybeSingle();

    userId = existingSubscription?.user_id || "";
  }

  if (!userId && record.customerEmail) {
    const targetEmail = record.customerEmail.toLowerCase();
    let page = 1;
    const perPage = 200;

    while (!userId) {
      const { data: usersPage, error: usersError } = await service.auth.admin.listUsers({
        page,
        perPage,
      });

      if (usersError || !usersPage?.users?.length) {
        break;
      }

      const matchedUser = usersPage.users.find(
        (item) => (item.email || "").toLowerCase() === targetEmail
      );

      if (matchedUser?.id) {
        userId = matchedUser.id;
        break;
      }

      if (usersPage.users.length < perPage) {
        break;
      }

      page += 1;
    }
  }

  if (!userId) {
    return NextResponse.json(
      { message: "Webhook payload is missing a user reference." },
      { status: 400 }
    );
  }

  const { error } = await service.from("subscriptions").upsert(
    {
      user_id: userId,
      lemon_squeezy_subscription_id: record.subscriptionId,
      lemon_squeezy_customer_id: record.customerId,
      lemon_squeezy_order_id: record.orderId,
      lemon_squeezy_product_id: record.productId,
      lemon_squeezy_variant_id: record.variantId,
      status: record.status,
      status_formatted: record.statusFormatted,
      plan_name: record.planName,
      customer_email: record.customerEmail,
      renews_at: record.renewsAt,
      ends_at: record.endsAt,
      trial_ends_at: record.trialEndsAt,
      update_payment_method_url: record.updatePaymentMethodUrl,
      customer_portal_url: record.customerPortalUrl,
      raw_event: record.rawEvent,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}