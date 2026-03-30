import { NextResponse } from "next/server";
import {
  createLemonSqueezyCheckout,
  isBillingPlanId,
  isLemonSqueezyEnabled,
} from "@/lib/billing/lemonsqueezy";

export async function POST(request: Request) {
  if (!isLemonSqueezyEnabled()) {
    return NextResponse.json(
      { message: "LemonSqueezy is not configured yet." },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      name?: string;
      userId?: string;
      planId?: string;
      redirectPath?: string;
    };

    if (body.planId && !isBillingPlanId(body.planId)) {
      return NextResponse.json({ message: "Unknown billing plan." }, { status: 400 });
    }

    const planId = body.planId && isBillingPlanId(body.planId) ? body.planId : undefined;

    const checkoutUrl = await createLemonSqueezyCheckout({
      email: body.email,
      name: body.name,
      userId: body.userId,
      planId,
      redirectPath: body.redirectPath || "/dashboard",
    });

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create checkout.";
    return NextResponse.json({ message }, { status: 500 });
  }
}