export const runtime = "nodejs";

import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { Resend } from "resend";

import { createServiceClient } from "@/lib/supabase/service";
import type { ContractAcceptanceEvidence, ContractData } from "@/app/types/contracts";
import { normalizeContractData } from "@/lib/contract/schema";

type RespondRouteContext = {
  params: Promise<{ publicToken: string }>;
};

const ACCEPTANCE_CONSENT_TEXT =
  "I confirm I have reviewed this agreement and agree to be legally bound by its terms.";

type ContractRow = {
  id: string;
  public_token: string;
  client_email: string;
  influencer_email: string | null;
  status: string;
  contract_data: ContractData;
};

export async function POST(req: Request, context: RespondRouteContext) {
  try {
    const { publicToken } = await context.params;
    const body = await req.json();
    const action = body?.action as "request_changes" | "accept" | undefined;

    if (!action) {
      return NextResponse.json(
        { success: false, message: "Action is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data: contract, error: contractError } = await supabase
      .from("contracts")
      .select("id, public_token, client_email, influencer_email, status, contract_data")
      .eq("public_token", publicToken)
      .single<ContractRow>();

    if (contractError || !contract) {
      return NextResponse.json(
        { success: false, message: "Contract not found" },
        { status: 404 }
      );
    }

    // Prevent any action on a finalized contract.
    if (contract.status === "completed" || contract.status === "accepted") {
      return NextResponse.json(
        { success: false, message: "Contract is already finalized" },
        { status: 409 }
      );
    }

    if (action === "request_changes") {
      const feedback = typeof body?.feedback === "string" ? body.feedback.trim() : "";
      const incomingData = (body?.contractData || {}) as Partial<ContractData>;

      const nextData = normalizeContractData(
        {
          ...contract.contract_data,
          ...incomingData,
          clientEmail: contract.client_email,
        },
        contract.client_email
      );

      const { error: updateError } = await supabase
        .from("contracts")
        .update({
          status: "changes_requested",
          feedback,
          contract_data: nextData,
        })
        .eq("id", contract.id);

      if (updateError) {
        return NextResponse.json(
          { success: false, message: updateError.message },
          { status: 500 }
        );
      }

      // Notify the sender that the client has requested changes.
      if (process.env.RESEND_API_KEY && contract.influencer_email) {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);
          const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
            const baseUrl = new URL(req.url).origin;
            const reviewUrl = `${baseUrl}/contract/${contract.public_token}`;
          await resend.emails.send({
            from: fromEmail,
            to: contract.influencer_email,
            subject: `Changes requested on your contract - ${nextData.brandName || "Contract"}`,
            html: `
              <p>Hello,</p>
              <p>The client has reviewed your contract and requested changes.</p>
              ${feedback ? `<p><strong>Their feedback:</strong> ${feedback}</p>` : ""}
                <p>Review the contract and send an updated version to the client:</p>
                <p>
                  <a href="${reviewUrl}" target="_blank" rel="noopener noreferrer">
                    Review &amp; send updated contract
                  </a>
                </p>
                <p style="word-break: break-all;">${reviewUrl}</p>
            `,
          });
        } catch {
          // Non-critical — proceed even if notification email fails.
        }
      }

      return NextResponse.json({ success: true, status: "changes_requested" });
    }

    const hasAcceptedTerms = body?.agreedToTerms === true;
    if (!hasAcceptedTerms) {
      return NextResponse.json(
        {
          success: false,
          message: "You must accept the legal consent statement before signing.",
        },
        { status: 400 }
      );
    }

    const signerName = typeof body?.signerName === "string" ? body.signerName.trim() : "";
    const signerTitle = typeof body?.signerTitle === "string" ? body.signerTitle.trim() : "";

    if (!signerName) {
      return NextResponse.json(
        {
          success: false,
          message: "Signer full legal name is required.",
        },
        { status: 400 }
      );
    }

    const incomingData = (body?.contractData || {}) as Partial<ContractData>;
    const acceptedData = normalizeContractData(
      {
        ...contract.contract_data,
        ...incomingData,
        clientEmail: contract.client_email,
      },
      contract.client_email
    );
    const acceptedAt = new Date().toISOString();
    const rawForwardedFor = req.headers.get("x-forwarded-for") || "";
    const acceptedIp = rawForwardedFor.split(",")[0]?.trim() || req.headers.get("x-real-ip") || null;
    const acceptedUserAgent = req.headers.get("user-agent") || null;
    const contractHash = createHash("sha256")
      .update(JSON.stringify(acceptedData))
      .digest("hex");
    const acceptanceEvidence: ContractAcceptanceEvidence = {
      signerEmail: contract.client_email,
      signerName,
      signerTitle: signerTitle || null,
      publicToken: contract.public_token,
      acceptedAt,
      acceptedIp,
      acceptedUserAgent,
      contractHash,
      consentText: ACCEPTANCE_CONSENT_TEXT,
      source: "link_review",
      version: 1,
    };

    const { error: completeError } = await supabase
      .from("contracts")
      .update({
        status: "accepted",
        contract_data: acceptedData,
        accepted_at: acceptedAt,
        accepted_ip: acceptedIp,
        accepted_user_agent: acceptedUserAgent,
        accepted_consent: true,
        accepted_consent_text: ACCEPTANCE_CONSENT_TEXT,
        contract_hash: contractHash,
        contract_snapshot: acceptedData,
        acceptance_evidence: acceptanceEvidence,
      })
      .eq("id", contract.id);

    if (completeError) {
      return NextResponse.json(
        { success: false, message: completeError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, status: "accepted", contractHash });
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
