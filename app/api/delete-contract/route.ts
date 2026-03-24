import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { contractId } = body;

    console.log("Delete API called with contractId:", contractId);

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

    console.log("User authenticated:", user.email);

    // First check if contract exists and belongs to user
    const { data: existingContract } = await supabase
      .from("contracts")
      .select("*")
      .eq("id", contractId)
      .eq("influencer_id", user.id)
      .single();

    if (!existingContract) {
      console.log("Contract not found or doesn't belong to user");
      return NextResponse.json(
        { success: false, message: "Contract not found" },
        { status: 404 }
      );
    }

    console.log("Contract found, deleting:", existingContract);

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

    console.log("Contract deleted successfully");
    return NextResponse.json({ success: true, message: "Contract deleted successfully" });
  } catch (error) {
    console.error("Delete contract error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
