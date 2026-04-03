import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { contractId } = body;

    if (!contractId) {
      return NextResponse.json(
        { success: false, message: "Contract ID is required" },
        { status: 400 }
      );
    }

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // First check if contract exists and belongs to user
    const { data: existingContract } = await supabase
      .from("contracts")
      .select("*")
      .eq("id", contractId)
      .eq("influencer_id", user.id)
      .single();

    if (!existingContract) {
      return NextResponse.json(
        { success: false, message: "Contract not found" },
        { status: 404 }
      );
    }

    // Delete the contract
    const { error } = await supabase
      .from("contracts")
      .delete()
      .eq("id", contractId)
      .eq("influencer_id", user.id);

    if (error) {
      console.error("Delete contract error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Contract deleted successfully" });
  } catch (error) {
    console.error("Delete contract error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
