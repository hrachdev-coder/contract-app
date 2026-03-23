import { NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase/service";
import type { ContractStatus } from "@/app/types/contracts";

export async function POST(
  req: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    const { feedback } = await req.json();

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

    const nextStatus: ContractStatus = "changes_requested";
    const { error: updateError } = await supabase
      .from("contracts")
      .update({
        status: nextStatus,
        feedback: feedback ?? null,
      })
      .eq("id", contract.id);

    if (updateError) {
      return NextResponse.json(
        { success: false, message: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Request changes failed",
      },
      { status: 500 }
    );
  }
}

