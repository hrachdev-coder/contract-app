export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Resend } from "resend";

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

    console.log("Using API Key:", process.env.RESEND_API_KEY ? "Key exists" : "Key missing");

    const resend = new Resend(process.env.RESEND_API_KEY);

    const data = await resend.emails.send({
      from: "hrach.dev@gmail.com",
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
