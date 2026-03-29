import { NextResponse } from "next/server";
import { createLemonSqueezyCheckout, isLemonSqueezyEnabled } from "@/lib/billing/lemonsqueezy";

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
      redirectPath?: string;
    };

    const checkoutUrl = await createLemonSqueezyCheckout({
      email: body.email,
      name: body.name,
      userId: body.userId,
      redirectPath: body.redirectPath || "/dashboard",
    });

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create checkout.";
    return NextResponse.json({ message }, { status: 500 });
  }
}