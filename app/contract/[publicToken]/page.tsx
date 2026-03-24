import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import ContractReviewClient from "../ContractReviewClient";
import type { ContractData } from "@/app/types/contracts";

type ContractPageProps = {
  params: Promise<{ publicToken: string }>;
};

type ContractRecord = {
  id: string;
  public_token: string;
  client_email: string;
  influencer_email: string | null;
  status: string;
  feedback: string | null;
  created_at: string;
  contract_data: ContractData | null;
};

export default async function ContractReviewPage({ params }: ContractPageProps) {
  const { publicToken } = await params;
  const supabase = createServiceClient();

  const { data: contract, error } = await supabase
    .from("contracts")
    .select("id, public_token, client_email, influencer_email, status, feedback, created_at, contract_data")
    .eq("public_token", publicToken)
    .single<ContractRecord>();

  if (error || !contract) {
    notFound();
  }

  if (contract.status === "sent" || contract.status === "updated") {
    await supabase
      .from("contracts")
      .update({ status: "viewed" })
      .eq("id", contract.id);

    contract.status = "viewed";
  }

  const safeContractData: ContractData = {
    clientEmail: contract.contract_data?.clientEmail || contract.client_email,
    brandName: contract.contract_data?.brandName || "",
    platform: contract.contract_data?.platform || "",
    deliverables: contract.contract_data?.deliverables || "",
    campaignStartDate: contract.contract_data?.campaignStartDate || "",
    campaignEndDate: contract.contract_data?.campaignEndDate || "",
    paymentAmount: contract.contract_data?.paymentAmount || "",
    currency: contract.contract_data?.currency || "USD",
    paymentDeadlineDays: contract.contract_data?.paymentDeadlineDays || "30",
    usageRights: contract.contract_data?.usageRights || "organic_only",
    revisions: contract.contract_data?.revisions || "1",
    exclusivity: Boolean(contract.contract_data?.exclusivity),
    exclusivityDuration: contract.contract_data?.exclusivityDuration || "",
  };

  return (
    <ContractReviewClient
      publicToken={contract.public_token}
      initialStatus={contract.status}
      initialFeedback={contract.feedback}
      clientEmail={contract.client_email}
      influencerEmail={contract.influencer_email}
      createdAt={contract.created_at}
      contractData={safeContractData}
    />
  );
}
