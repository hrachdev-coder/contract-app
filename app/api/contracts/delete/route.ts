import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const serviceSupabase = createServiceClient();
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

    // Use service-role delete to avoid RLS no-op responses and confirm actual deletion.
    const { data: deletedRows, error } = await serviceSupabase
      .from("contracts")
      .delete()
      .eq("id", contractId)
      .eq("influencer_id", user.id)
      .select("id");

    if (error) {
      console.error("Delete contract error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    if (!deletedRows || deletedRows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Contract not found or already deleted" },
        { status: 404 }
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
