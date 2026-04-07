export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Resend } from "resend";

import type { ContractData } from "@/app/types/contracts";
import { getRequestBaseUrl } from "@/lib/app-url";
import { normalizeContractData } from "@/lib/contract/schema";
import { createClient } from "@/lib/supabase/server";

type ResendRouteContext = {
  params: Promise<{ contractId: string }>;
};

export async function POST(req: Request, context: ResendRouteContext) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { success: false, message: "RESEND_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const { contractId } = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: contract, error: contractError } = await supabase
      .from("contracts")
      .select("id, client_email, influencer_email, influencer_id, contract_data, public_token, status")
      .eq("id", contractId)
      .eq("influencer_id", user.id)
      .single();

    if (contractError || !contract || !contract.public_token) {
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
        incomingContractData = normalizeContractData(
          body.contractData as Partial<ContractData>,
          contract.client_email
        );
      }
    } catch {
      // No JSON body is expected for the default resend button flow.
    }

    if (incomingContractData) {
      const { error: dataUpdateError } = await supabase
        .from("contracts")
        .update({ contract_data: incomingContractData })
        .eq("id", contract.id)
        .eq("influencer_id", user.id);

      if (dataUpdateError) {
        return NextResponse.json(
          { success: false, message: dataUpdateError.message },
          { status: 500 }
        );
      }
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const baseUrl = getRequestBaseUrl(req);
    const reviewUrl = `${baseUrl}/contract/${contract.public_token}`;
    const employerName = contract.influencer_email || user.email || "Your contract contact";

    const emailSendResult = await resend.emails.send({
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

    if (emailSendResult.error) {
      return NextResponse.json(
        {
          success: false,
          message: emailSendResult.error.message || "Failed to send client notification",
        },
        { status: 502 }
      );
    }

    await supabase
      .from("contracts")
      .update({ status: "updated", feedback: null })
      .eq("id", contract.id)
      .eq("influencer_id", user.id);

    return NextResponse.json({
      success: true,
      data: emailSendResult.data,
      recipient: contract.client_email,
      status: "updated",
    });
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