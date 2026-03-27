export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Resend } from "resend";

import { createClient } from "@/lib/supabase/server";
import { generateContractPdfBuffer } from "@/lib/contract/generateContractPdf";
import type { ContractData } from "@/app/types/contracts";
import { normalizeContractData } from "@/lib/contract/schema";

type ContractRow = {
  id: string;
  influencer_id: string;
  client_email: string;
  influencer_email: string | null;
  status: string;
  contract_data: ContractData;
};

export async function POST(req: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { success: false, message: "RESEND_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const supabase = await createClient();
    const body = await req.json();
    const contractId = body?.contractId as string | undefined;

    if (!contractId) {
      return NextResponse.json(
        { success: false, message: "Contract ID is required" },
        { status: 400 }
      );
    }

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
      .select("id, influencer_id, client_email, influencer_email, status, contract_data")
      .eq("id", contractId)
      .eq("influencer_id", user.id)
      .single<ContractRow>();

    if (contractError || !contract) {
      return NextResponse.json(
        { success: false, message: "Contract not found" },
        { status: 404 }
      );
    }

    if (contract.status !== "accepted") {
      return NextResponse.json(
        { success: false, message: "Only accepted contracts can be finalized" },
        { status: 409 }
      );
    }

    const contractData = normalizeContractData(contract.contract_data || {}, contract.client_email);
    const employerName = contract.influencer_email || "Influencer";

    const pdfBuffer = await generateContractPdfBuffer({
      employerName,
      contractData,
    });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const recipients = [contract.client_email, contract.influencer_email].filter(
      (email): email is string => Boolean(email)
    );

    const emailResult = await resend.emails.send({
      from: fromEmail,
      to: recipients,
      subject: `Final contract PDF - ${contractData.brandName || "Contract"}`,
      html: `
        <p>Hello,</p>
        <p>The contract has been accepted and finalized.</p>
        <p>The final PDF is attached to this email.</p>
      `,
      attachments: [
        {
          filename: "final-contract.pdf",
          content: pdfBuffer.toString("base64"),
        },
      ],
    });

    const { error: updateError } = await supabase
      .from("contracts")
      .update({ status: "completed" })
      .eq("id", contract.id)
      .eq("influencer_id", user.id);

    if (updateError) {
      return NextResponse.json(
        { success: false, message: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, status: "completed", emailResult });
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
