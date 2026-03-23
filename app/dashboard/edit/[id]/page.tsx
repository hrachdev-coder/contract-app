import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";

import EditContractForm from "./EditContractForm";

export default async function EditContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: contract, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !contract) {
    notFound();
  }

  if (contract.influencer_id !== user.id) {
    redirect("/dashboard");
  }

  return <EditContractForm contract={contract} />;
}

