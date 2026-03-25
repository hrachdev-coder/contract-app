export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

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
      .select("id, client_email, influencer_email, contract_data, public_token")
      .eq("public_token", publicToken)
      .eq("influencer_id", user.id)
      .single();

    if (contractError || !contract) {
      return NextResponse.json(
        { success: false, message: "Contract not found" },
        { status: 404 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const baseUrl = new URL(req.url).origin;
    const reviewUrl = `${baseUrl}/contract/${contract.public_token}`;
    const employerName = contract.influencer_email || "Your collaborator";

    const result = await resend.emails.send({
      from: fromEmail,
      to: contract.client_email,
      subject: `Contract review from ${employerName}`,
      html: `
        <p>Hello,</p>
        <p><b>${employerName}</b> has sent you a contract to review.</p>
        <p>
          <a href="${reviewUrl}" target="_blank" rel="noopener noreferrer">
            Review and accept or request changes
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
