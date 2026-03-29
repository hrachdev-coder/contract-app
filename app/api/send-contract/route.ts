export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Resend } from "resend";

import { normalizeContractData } from "@/lib/contract/schema";
import { getContractTemplateById } from "@/lib/contract/templates";

export async function POST(req: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { success: false, message: "RESEND_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    // Always use the configured sender — never trust client-supplied addresses.
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    const body = await req.json();
    const { email, employerName, contractData, publicToken } = body;

    console.log("=== EMAIL SEND DEBUG ===");
    console.log("To:", email);
    console.log("From:", fromEmail);

    // Վերահսկում պարտադիր դաշտերը
    if (!email || !employerName || !contractData || !publicToken) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const normalizedContractData = normalizeContractData(contractData, email);
  const template = getContractTemplateById(normalizedContractData.contractTemplate);

    const baseUrl = new URL(req.url).origin;
    const reviewUrl = `${baseUrl}/contract/${publicToken}`;

    const subject = `Service contract from ${employerName}`;

    console.log("Sending email via Resend...");
    
    const data = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject,
      html: `
        <p>Hello,</p>
        <p><b>${employerName}</b> has sent you a service contract to review.</p>
        <p><b>Template:</b> ${template.name}</p>
        <p>
          <a href="${reviewUrl}" target="_blank" rel="noopener noreferrer">
            Review contract
          </a>
        </p>
        <p>If the button does not work, copy and paste this URL into your browser:</p>
        <p style="word-break: break-all;">${reviewUrl}</p>
      `,
    });

    console.log("Email sent successfully:", data);

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