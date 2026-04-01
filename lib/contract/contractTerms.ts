import type { ContractData } from "@/app/types/contracts";
import { getContractTemplateById } from "@/lib/contract/templates";

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
  clientEmail: string;
  contractData: ContractData;
  createdAt?: string;
}): ContractSection[] {
  const { employerName, clientEmail, contractData, createdAt } = args;

  const companyName = fallback(contractData.brandName, "Company");
  const employer = fallback(employerName, "Company Representative");
  const client = fallback(clientEmail, "Client");
  const template = getContractTemplateById(contractData.contractTemplate);
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
    ? `Client agrees not to work with direct competitors for ${fallback(
        contractData.exclusivityDuration,
        "the project period"
      )}.`
    : "No exclusivity obligations apply unless otherwise agreed in writing.";

  return [
    {
      title: "1. Parties",
      body: `This Client Service Agreement (the \"Agreement\") is entered into on ${effectiveDate} between ${companyName} (represented by ${employer}) and the Client (${client}). This agreement is based on the ${template.name} template selected by the Company.`,
    },
    {
      title: "2. Scope of Work",
      body: `Client-facing deliverables will be produced and delivered on ${platform}. Deliverables include: ${deliverables}. Services will be performed professionally and in accordance with the project brief provided by the Company.`,
    },
    {
      title: "3. Project Timeline",
      body: `The project period starts on ${campaignStart} and ends on ${campaignEnd}. All deliverables must be submitted within this period unless both parties approve a revised schedule in writing.`,
    },
    {
      title: "4. Compensation",
      body: `Company will pay Client ${paymentAmount} ${paymentCurrency}. Payment is due within ${paymentDeadlineDays} days from receipt of valid invoice and completion of deliverables (unless otherwise agreed in writing).`,
    },
    {
      title: "5. Content Usage Rights",
      body: `Usage rights granted to Company: ${usageRights}. Any use outside this scope requires Client's prior written approval.`,
    },
    {
      title: "6. Revisions",
      body: `Client includes ${revisions} revision round(s) in the agreed fee. Additional revisions may be billed separately upon mutual agreement.`,
    },
    {
      title: "7. Exclusivity",
      body: exclusivityText,
    },
    {
      title: "8. Intellectual Property",
      body: "All work, deliverables, and intellectual property created by Company under this Agreement remain the property of Company unless expressly transferred in writing. Client receives only the usage rights specified in Section 5.",
    },
    {
      title: "9. Confidentiality",
      body: "Both parties agree to keep confidential any non-public business, project, pricing, or strategic information received during this engagement. This obligation survives termination of the Agreement.",
    },
    {
      title: "10. Limitation of Liability",
      body: "Neither party shall be liable for indirect, incidental, consequential, or punitive damages arising from this Agreement. Each party's total liability is limited to the fees paid or owed under this Agreement.",
    },
    {
      title: "11. Force Majeure",
      body: "Neither party shall be liable for failure to perform obligations due to unforeseeable circumstances beyond reasonable control, including natural disasters, pandemics, government actions, or acts of God. The affected party must provide written notice and make reasonable efforts to resume performance.",
    },
    {
      title: "12. Dispute Resolution",
      body: "Disputes shall be resolved through good faith negotiation. If negotiation fails, disputes will be resolved through binding arbitration or mediation as mutually agreed, under the rules of the jurisdiction where the Company resides. Both parties waive the right to jury trial.",
    },
    {
      title: "13. Termination",
      body: "Either party may terminate this Agreement for material breach if the breach is not cured within 14 days of written notice. Upon termination, completed and approved work remains payable, and all confidentiality obligations survive termination.",
    },
    {
      title: "14. Entire Agreement",
      body: "This Agreement, including all referenced templates and attachments, constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, and agreements. Any amendments must be made in writing and signed by both parties.",
    },
    {
      title: "15. Acceptance",
      body: "By approving this Agreement, both parties confirm they have read, understood, and agreed to the terms stated above. Electronic signatures are binding and equivalent to original signatures.",
    },
  ];
}
