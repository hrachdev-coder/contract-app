export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase/service";
import type { ContractData } from "@/app/types/contracts";

type RespondRouteContext = {
  params: Promise<{ publicToken: string }>;
};

type ContractRow = {
  id: string;
  public_token: string;
  client_email: string;
  influencer_email: string | null;
  status: string;
  contract_data: ContractData;
};

function normalizeContractData(input: Partial<ContractData>, clientEmail: string): ContractData {
  return {
    clientEmail: input.clientEmail || clientEmail,
    brandName: input.brandName || "",
    platform: input.platform || "",
    deliverables: input.deliverables || "",
    campaignStartDate: input.campaignStartDate || "",
    campaignEndDate: input.campaignEndDate || "",
    paymentAmount: input.paymentAmount || "",
    currency: input.currency || "USD",
    paymentDeadlineDays: input.paymentDeadlineDays || "30",
    usageRights: input.usageRights || "organic_only",
    revisions: input.revisions || "1",
    exclusivity: Boolean(input.exclusivity),
    exclusivityDuration: input.exclusivityDuration || "",
  };
}

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

    // Prevent any action on an already-completed contract to avoid duplicate PDFs.
    if (contract.status === "completed") {
      return NextResponse.json(
        { success: false, message: "Contract is already completed" },
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

      return NextResponse.json({ success: true, status: "changes_requested" });
    }

    const { error: completeError } = await supabase
      .from("contracts")
      .update({
        status: "completed",
      })
      .eq("id", contract.id);

    if (completeError) {
      return NextResponse.json(
        { success: false, message: completeError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, status: "completed" });
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
