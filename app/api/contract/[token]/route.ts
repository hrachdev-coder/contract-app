import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const supabase = await createServiceClient();

  const { influencer_id, influencer_email, client_email, contract_data } =
    await req.json();

  const { data, error } = await supabase
    .from("contracts")
    .insert({
      influencer_id,
      influencer_email,
      client_email,
      contract_data,
      status: "sent",
      public_token: uuidv4(),  // <== այս մասն է կարևոր
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ contract: data });
}