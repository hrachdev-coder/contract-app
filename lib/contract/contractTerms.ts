import type { ContractData } from "@/app/types/contracts";

export type ContractSection = {
  title: string;
  body: string;
};

function fallback(value: string | null | undefined, defaultValue: string) {
  const trimmed = (value || "").trim();
  return trimmed.length > 0 ? trimmed : defaultValue;
}

export function formatContractDate(rawDate: string | null | undefined) {
  if (!rawDate) return "Not specified";
  const date = new Date(`${rawDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Not specified";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function labelUsageRights(rawValue: string) {
  if (rawValue === "organic_only") return "Organic usage only";
  if (rawValue === "paid_ads") return "Paid advertising usage";
  if (rawValue === "full_buyout") return "Full buyout / transfer of rights";
  return fallback(rawValue, "Not specified");
}

export function buildContractSections(args: {
  employerName: string;
  creatorEmail: string;
  contractData: ContractData;
  createdAt?: string;
}): ContractSection[] {
  const { employerName, creatorEmail, contractData, createdAt } = args;

  const brandName = fallback(contractData.brandName, "Brand");
  const employer = fallback(employerName, "Brand Representative");
  const creator = fallback(creatorEmail, "Creator");
  const platform = fallback(contractData.platform, "Not specified");
  const deliverables = fallback(contractData.deliverables, "Not specified");
  const campaignStart = formatContractDate(contractData.campaignStartDate);
  const campaignEnd = formatContractDate(contractData.campaignEndDate);
  const effectiveDate = formatContractDate(createdAt || contractData.campaignStartDate);
  const paymentAmount = fallback(contractData.paymentAmount, "0");
  const paymentCurrency = fallback(contractData.currency, "USD");
  const paymentDeadlineDays = fallback(contractData.paymentDeadlineDays, "30");
  const usageRights = labelUsageRights(contractData.usageRights);
  const revisions = fallback(contractData.revisions, "0");
  const exclusivityText = contractData.exclusivity
    ? `Creator agrees not to promote direct competitors for ${fallback(
        contractData.exclusivityDuration,
        "the campaign period"
      )}.`
    : "No exclusivity obligations apply unless otherwise agreed in writing.";

  return [
    {
      title: "1. Parties",
      body: `This Influencer Campaign Agreement (the \"Agreement\") is entered into on ${effectiveDate} between ${brandName} (represented by ${employer}) and the Creator (${creator}).`,
    },
    {
      title: "2. Scope of Work",
      body: `Creator will produce and publish campaign content on ${platform}. Deliverables include: ${deliverables}. Creator shall perform the services professionally and in accordance with the campaign brief provided by the Brand.`,
    },
    {
      title: "3. Campaign Timeline",
      body: `The campaign period starts on ${campaignStart} and ends on ${campaignEnd}. All deliverables must be submitted and/or published within this period unless both parties approve a revised schedule in writing.`,
    },
    {
      title: "4. Compensation",
      body: `Brand will pay Creator ${paymentAmount} ${paymentCurrency}. Payment is due within ${paymentDeadlineDays} days from receipt of valid invoice and completion of deliverables (unless otherwise agreed in writing).`,
    },
    {
      title: "5. Content Usage Rights",
      body: `Usage rights granted to Brand: ${usageRights}. Any use outside this scope requires Creator's prior written approval.`,
    },
    {
      title: "6. Revisions",
      body: `Creator includes ${revisions} revision round(s) in the agreed fee. Additional revisions may be billed separately upon mutual agreement.`,
    },
    {
      title: "7. Exclusivity",
      body: exclusivityText,
    },
    {
      title: "8. Confidentiality",
      body: "Both parties agree to keep confidential any non-public business, campaign, pricing, or strategic information received during this engagement.",
    },
    {
      title: "9. Termination",
      body: "Either party may terminate this Agreement for material breach if the breach is not cured within a reasonable written notice period. Completed and approved work remains payable.",
    },
    {
      title: "10. Acceptance",
      body: "By approving this Agreement, both parties confirm they have read, understood, and agreed to the terms stated above.",
    },
  ];
}
