export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL || null;

  return NextResponse.json({
    success: true,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
    origin,
    configuredAppUrl,
    appUrlMatchesOrigin: configuredAppUrl === origin,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      RESEND_API_KEY: Boolean(process.env.RESEND_API_KEY),
      RESEND_FROM_EMAIL: Boolean(process.env.RESEND_FROM_EMAIL),
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Check if API key is set
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { success: false, message: "RESEND_API_KEY is not set in environment variables" },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    const data = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Test Email from Contract App",
      html: `
        <h2>Test Email</h2>
        <p>This is a test email to verify the email sending is working.</p>
        <p>If you receive this, the email system is working correctly!</p>
        <p>Time: ${new Date().toLocaleString()}</p>
      `,
    });

    console.log("Email sent successfully:", data);

    return NextResponse.json({ 
      success: true, 
      message: "Test email sent successfully",
      data 
    });
  } catch (error) {
    console.error("TEST EMAIL ERROR:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Test email failed",
        error: error instanceof Error ? error.stack : "Unknown error",
      },
      { status: 500 }
    );
  }
}
