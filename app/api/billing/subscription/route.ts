import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isLemonSqueezyEnabled, isPaidSubscriptionStatus } from "@/lib/billing/lemonsqueezy";

type SubscriptionRow = {
  status: string | null;
  status_formatted: string | null;
  plan_name: string | null;
  renews_at: string | null;
  ends_at: string | null;
  customer_portal_url: string | null;
  update_payment_method_url: string | null;
};

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const configured = isLemonSqueezyEnabled();

  if (!configured) {
    return NextResponse.json({
      configured: false,
      hasActiveAccess: true,
      subscription: null,
    });
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      "status, status_formatted, plan_name, renews_at, ends_at, customer_portal_url, update_payment_method_url"
    )
    .eq("user_id", user.id)
    .maybeSingle<SubscriptionRow>();

  if (error) {
    const code = (error as { code?: string }).code || "";
    const message = error.message || "";

    // Surface a clear setup error when billing table migration has not been applied yet.
    if (
      code === "PGRST205" ||
      /subscriptions/i.test(message) && /not found|does not exist/i.test(message)
    ) {
      return NextResponse.json(
        {
          message:
            "Billing subscriptions table is missing. Run supabase/migrations/20260329_billing_subscriptions.sql.",
          needsBillingMigration: true,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    configured: true,
    hasActiveAccess: isPaidSubscriptionStatus(data?.status),
    subscription: data || null,
  });
}