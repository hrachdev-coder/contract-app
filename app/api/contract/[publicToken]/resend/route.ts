export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Resend } from "resend";
import type { ContractData } from "@/app/types/contracts";

type ResendRouteContext = {
  params: Promise<{ publicToken: string }>;
};

export async function POST(req: Request, context: ResendRouteContext) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { success: false, message: "RESEND_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const { publicToken } = await context.params;
    const { createServiceClient } = await import("@/lib/supabase/service");
    const supabase = createServiceClient();

    const { data: contract, error: contractError } = await supabase
      .from("contracts")
      .select("id, client_email, influencer_email, contract_data, public_token, status")
      .eq("public_token", publicToken)
      .single();

    if (contractError || !contract) {
      return NextResponse.json(
        { success: false, message: "Contract not found" },
        { status: 404 }
      );
    }

    if (contract.status === "accepted" || contract.status === "completed") {
      return NextResponse.json(
        { success: false, message: "Contract is already finalized" },
        { status: 409 }
      );
    }

    let incomingContractData: ContractData | null = null;
    try {
      const body = await req.json();
      if (body && typeof body.contractData === "object") {
        incomingContractData = body.contractData as ContractData;
      }
    } catch {
      // No JSON body is expected for the default resend button flow.
    }

    if (incomingContractData) {
      const { error: dataUpdateError } = await supabase
        .from("contracts")
        .update({ contract_data: incomingContractData })
        .eq("id", contract.id);

      if (dataUpdateError) {
        return NextResponse.json(
          { success: false, message: dataUpdateError.message },
          { status: 500 }
        );
      }
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const baseUrl = new URL(req.url).origin;
    const reviewUrl = `${baseUrl}/contract/${contract.public_token}`;
    const employerName = contract.influencer_email || "Your brand contact";

    const result = await resend.emails.send({
      from: fromEmail,
      to: contract.client_email,
      subject: `Your requested changes were approved — ${employerName}`,
      html: `
        <p>Hello,</p>
        <p><b>${employerName}</b> has reviewed your requested changes and sent you an updated contract.</p>
        <p>Please review the updated terms and accept or request further edits.</p>
        <p>
          <a href="${reviewUrl}" target="_blank" rel="noopener noreferrer">
            Review updated contract
          </a>
        </p>
        <p>If the link does not work, copy and paste this URL:</p>
        <p style="word-break: break-all;">${reviewUrl}</p>
      `,
    });

    await supabase
      .from("contracts")
      .update({ status: "updated", feedback: null })
      .eq("id", contract.id);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Resend failed",
      },
      { status: 500 }
    );
  }
}
