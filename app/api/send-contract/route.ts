export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Resend } from "resend";

import { normalizeContractData } from "@/lib/contract/schema";
import { getContractTemplateById } from "@/lib/contract/templates";
import { getRequestBaseUrl } from "@/lib/app-url";

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

    // Validate required fields
    if (!email || !employerName || !contractData || !publicToken) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const normalizedContractData = normalizeContractData(contractData, email);
  const template = getContractTemplateById(normalizedContractData.contractTemplate);

    const baseUrl = getRequestBaseUrl(req);
    const reviewUrl = `${baseUrl}/contract/${publicToken}`;

    const subject = `Service contract from ${employerName}`;

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

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Email failed",
      },
      { status: 500 }
    );
  }
}