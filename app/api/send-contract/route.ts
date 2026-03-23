export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, employerName, contractData, publicToken } = body;

    // Վերահսկում պարտադիր դաշտերը
    if (!email || !employerName || !contractData || !publicToken) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const reviewUrl = `${baseUrl}/contract/${publicToken}`;

    const subject = `Contract review from ${employerName}`;

    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject,
      html: `
        <p>Hello,</p>
        <p><b>${employerName}</b> has sent you a contract to review.</p>
        <p>
          <a href="${reviewUrl}" target="_blank" rel="noopener noreferrer">
            Review and accept or request changes
          </a>
        </p>
        <p>If the link doesn’t work, copy/paste this URL into your browser:</p>
        <p style="word-break: break-all;">${reviewUrl}</p>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("EMAIL ERROR:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Email failed",
      },
      { status: 500 }
    );
  }
}