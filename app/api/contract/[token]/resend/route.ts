import { NextResponse } from "next/server";
import { Resend } from "resend";

import { createServiceClient } from "@/lib/supabase/service";
import type { ContractStatus } from "@/app/types/contracts";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  _req: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;

    const supabase = await createServiceClient();

    const { data: contract, error } = await supabase
      .from("contracts")
      .select("*")
      .eq("public_token", token)
      .single();

    if (error || !contract) {
      return NextResponse.json(
        { success: false, message: "Contract not found" },
        { status: 404 }
      );
    }

    if (contract.status === "completed") {
      return NextResponse.json(
        { success: false, message: "Contract is completed" },
        { status: 400 }
      );
    }

    if (contract.status === "accepted") {
      return NextResponse.json(
        { success: false, message: "Contract already accepted" },
        { status: 409 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const reviewUrl = `${baseUrl}/contract/${token}`;

    const employerName = contract.influencer_email as string;
    const toEmail = contract.client_email as string;

    if (!employerName || !toEmail) {
      return NextResponse.json(
        { success: false, message: "Missing contract info" },
        { status: 500 }
      );
    }

    const nextStatus: ContractStatus = "updated";
    const { error: updateError } = await supabase
      .from("contracts")
      .update({ status: nextStatus })
      .eq("id", contract.id);

    if (updateError) {
      return NextResponse.json(
        { success: false, message: updateError.message },
        { status: 500 }
      );
    }

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: toEmail,
      subject: `Contract updated by ${employerName}`,
      html: `
        <p>Hello,</p>
        <p><b>${employerName}</b> has updated your contract.</p>
        <p>
          <a href="${reviewUrl}" target="_blank" rel="noopener noreferrer">
            Review and accept or request changes
          </a>
        </p>
        <p style="word-break: break-all;">If the link doesn’t work, copy/paste:</p>
        <p style="word-break: break-all;">${reviewUrl}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Resend failed",
      },
      { status: 500 }
    );
  }
}

