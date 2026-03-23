import { notFound } from "next/navigation";

import { createServiceClient } from "@/lib/supabase/service";
import ContractReviewClient from "./ContractReviewClient";

export const dynamic = "force-dynamic";

export default async function ContractPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createServiceClient();

  const { data: contract, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("public_token", token)
    .single();

  if (error || !contract) {
    notFound();
  }

  // First open: sent -> viewed
  if (contract.status === "sent") {
    const { error: updateError } = await supabase
      .from("contracts")
      .update({ status: "viewed" })
      .eq("id", contract.id);

    if (!updateError) {
      contract.status = "viewed";
    }
  }

  return <ContractReviewClient contract={contract} />;
}

