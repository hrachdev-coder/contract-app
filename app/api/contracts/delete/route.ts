import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
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

    let deletedRows: Array<{ id: string }> | null = null;
    let error: { message?: string } | null = null;

    // Try service-role delete first. If env is missing in production, fall back
    // to the authenticated server client so the feature still works.
    try {
      const serviceSupabase = createServiceClient();
      const serviceDelete = await serviceSupabase
        .from("contracts")
        .delete()
        .eq("id", contractId)
        .eq("influencer_id", user.id)
        .select("id");

      deletedRows = serviceDelete.data as Array<{ id: string }> | null;
      error = serviceDelete.error as { message?: string } | null;
    } catch (serviceClientError) {
      console.warn("Service client unavailable, using authenticated delete:", serviceClientError);
      const fallbackDelete = await supabase
        .from("contracts")
        .delete()
        .eq("id", contractId)
        .eq("influencer_id", user.id)
        .select("id");

      deletedRows = fallbackDelete.data as Array<{ id: string }> | null;
      error = fallbackDelete.error as { message?: string } | null;
    }

    if (error) {
      console.error("Delete contract error:", error);
      return NextResponse.json(
        { success: false, message: error.message || "Delete failed" },
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
