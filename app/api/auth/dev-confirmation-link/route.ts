export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: Request) {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, message: "Unavailable in production" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email } = body as { email?: string };

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback?next=/dashboard`;

    const { data, error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo,
      },
    });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    const actionLink =
      (data as { properties?: { action_link?: string } })?.properties?.action_link ||
      (data as { action_link?: string })?.action_link ||
      null;

    if (!actionLink) {
      return NextResponse.json(
        { success: false, message: "Failed to generate dev sign-in link" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, actionLink });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unexpected error",
      },
      { status: 500 }
    );
  }
}
