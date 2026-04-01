import { NextResponse } from "next/server";
import {
  createLemonSqueezyCheckout,
  isBillingPlanId,
  isLemonSqueezyEnabled,
} from "@/lib/billing/lemonsqueezy";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!isLemonSqueezyEnabled()) {
    return NextResponse.json(
      { message: "LemonSqueezy is not configured yet." },
      { status: 503 }
    );
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

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
      email: body.email || user.email,
      name: body.name,
      // Always bind checkout to the authenticated user to ensure webhook mapping works.
      userId: user.id,
      planId,
      redirectPath: body.redirectPath || "/dashboard",
    });

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create checkout.";
    return NextResponse.json({ message }, { status: 500 });
  }
}