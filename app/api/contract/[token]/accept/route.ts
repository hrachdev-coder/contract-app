import { NextResponse } from "next/server";
import { Resend } from "resend";

import { createServiceClient } from "@/lib/supabase/service";
import { generateContractPdfBuffer } from "@/lib/contract/generateContractPdf";
import type { ContractData, ContractStatus } from "@/app/types/contracts";

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

    if (
      contract.status !== "sent" &&
      contract.status !== "viewed" &&
      contract.status !== "updated"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot accept from status: ${contract.status}`,
        },
        { status: 409 }
      );
    }

    const nextStatus: ContractStatus = "accepted";
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

    // Generate PDF ONLY after the contract is marked as `accepted`
    const employerName = contract.influencer_email as string;
    const contractData = contract.contract_data as ContractData;

    if (!employerName || !contractData) {
      return NextResponse.json(
        { success: false, message: "Missing contract info" },
        { status: 500 }
      );
    }

    const pdfBuffer = await generateContractPdfBuffer({
      employerName,
      contractData,
    });

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: contract.client_email as string,
      subject: "Your Contract PDF",
      html: `<p>Hello,</p><p>Please find your finalized contract attached.</p>`,
      attachments: [
        {
          content: pdfBuffer.toString("base64"),
          filename: "contract.pdf",
          contentType: "application/pdf",
        },
      ],
    });

    const { error: completedError } = await supabase
      .from("contracts")
      .update({ status: "completed" })
      .eq("id", contract.id);

    if (completedError) {
      return NextResponse.json(
        { success: false, message: completedError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Accept failed",
      },
      { status: 500 }
    );
  }
}

