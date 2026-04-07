export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";

import ContractReviewClient from "@/app/contract/ContractReviewClient";
import type { ContractData } from "@/app/types/contracts";
import { normalizeContractData } from "@/lib/contract/schema";
import { createClient } from "@/lib/supabase/server";

type DashboardContractReviewPageProps = {
  params: Promise<{ contractId: string }>;
};

type ContractRecord = {
  id: string;
  public_token: string | null;
  client_email: string;
  influencer_email: string | null;
  influencer_id: string;
  status: string;
  feedback: string | null;
  created_at: string;
  contract_data: ContractData | null;
};

export default async function DashboardContractReviewPage(
  props: DashboardContractReviewPageProps
) {
  const { contractId } = await props.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: contract, error } = await supabase
    .from("contracts")
    .select(
      "id, public_token, client_email, influencer_email, influencer_id, status, feedback, created_at, contract_data"
    )
    .eq("id", contractId)
    .eq("influencer_id", user.id)
    .single<ContractRecord>();

  if (error || !contract || !contract.public_token) {
    notFound();
  }

  const safeContractData: ContractData = normalizeContractData(
    contract.contract_data,
    contract.client_email
  );

  return (
    <ContractReviewClient
      publicToken={contract.public_token}
      contractId={contract.id}
      initialStatus={contract.status}
      initialFeedback={contract.feedback}
      clientEmail={contract.client_email}
      senderEmail={contract.influencer_email}
      createdAt={contract.created_at}
      contractData={safeContractData}
      viewerRole="sender"
    />
  );
}