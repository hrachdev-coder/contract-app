import type { ContractData } from "@/app/types/contracts";
import { getContractTemplateById } from "@/lib/contract/templates";

export type ContractSection = {
  title: string;
  body: string;
};

function asPositiveNumber(rawValue: string | null | undefined) {
  const value = Number((rawValue || "").trim());
  return Number.isFinite(value) && value > 0 ? value : null;
}

function formatDuration(valueRaw: string, unitRaw: string, fallbackLabel: string) {
  const value = asPositiveNumber(valueRaw);
  if (!value) return fallbackLabel;
  const unit = (unitRaw || "months").trim();
  return `${value} ${unit}`;
}

function normalizeDeliverables(contractData: ContractData) {
  const fromArray = (contractData.deliverablesItems || []).map((item) => item.trim()).filter(Boolean);
  if (fromArray.length > 0) return fromArray;

  const text = (contractData.deliverables || "").trim();
  if (!text) return [];

  return text
    .split(/\n|,|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildRiskWarnings(contractData: ContractData) {
  const warnings: string[] = [];
  const hasDeliverables = normalizeDeliverables(contractData).length > 0;

  if (!hasDeliverables) {
    warnings.push("Deliverables list is empty. Scope ambiguity may create payment and quality disputes.");
  }

  if (contractData.exclusivity && !asPositiveNumber(contractData.exclusivityDurationValue)) {
    warnings.push("Exclusivity is enabled but duration is invalid. Use numeric value plus time unit.");
  }

  if (!asPositiveNumber(contractData.usageDurationValue)) {
    warnings.push("Usage duration is missing or invalid. IP/license period may be unenforceable.");
  }

  if (!asPositiveNumber(contractData.revisionTurnaroundDays)) {
    warnings.push("Revision turnaround deadline is missing.");
  }

  if (!asPositiveNumber(contractData.approvalDeadlineDays)) {
    warnings.push("Approval deadline is missing. Delivery acceptance may remain open-ended.");
  }

  if (contractData.contractTemplate === "instagram" && !fallback(contractData.postingRequirements, "").trim()) {
    warnings.push("Posting requirements are empty for a social campaign template.");
  }

  if (!asPositiveNumber(contractData.latePaymentPenaltyPercent)) {
    warnings.push("Late payment penalty is not configured.");
  }

  if (!asPositiveNumber(contractData.killFeePercent)) {
    warnings.push("Kill fee is not configured.");
  }

  if (contractData.paymentStructure === "upfront_partial" && !asPositiveNumber(contractData.upfrontPaymentPercent)) {
    warnings.push("Partial upfront payment selected without valid upfront percentage.");
  }

  return warnings;
}

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
  const companyRepresentative = fallback(employerName, "Company Representative");
  const creator = fallback(clientEmail, "Creator");
  const template = getContractTemplateById(contractData.contractTemplate);
  const platform = fallback(contractData.platform, "Not specified");
  const deliverables = normalizeDeliverables(contractData);
  const deliverablesList =
    deliverables.length > 0
      ? deliverables.map((item, index) => `${index + 1}. ${item}`).join(" ")
      : "Not specified";
  const campaignStart = formatContractDate(contractData.campaignStartDate);
  const campaignEnd = formatContractDate(contractData.campaignEndDate);
  const effectiveDate = formatContractDate(createdAt || contractData.campaignStartDate);
  const paymentAmount = fallback(contractData.paymentAmount, "0");
  const paymentCurrency = fallback(contractData.currency, "USD");
  const paymentDeadlineDays = fallback(contractData.paymentDeadlineDays, "30");
  const paymentStructure = fallback(contractData.paymentStructure, "on_delivery");
  const upfrontPaymentPercent = fallback(contractData.upfrontPaymentPercent, "0");
  const latePaymentPenaltyPercent = fallback(contractData.latePaymentPenaltyPercent, "0");
  const killFeePercent = fallback(contractData.killFeePercent, "0");
  const usageRights = labelUsageRights(contractData.usageRights);
  const usageDuration = formatDuration(
    contractData.usageDurationValue,
    contractData.usageDurationUnit,
    "Not specified"
  );
  const revisions = fallback(contractData.revisions, "0");
  const revisionTurnaroundDays = fallback(contractData.revisionTurnaroundDays, "5");
  const approvalDeadlineDays = fallback(contractData.approvalDeadlineDays, "7");
  const postingRequirements = fallback(contractData.postingRequirements, "Not specified");
  const exclusivityDuration = formatDuration(
    contractData.exclusivityDurationValue,
    contractData.exclusivityDurationUnit,
    fallback(contractData.exclusivityDuration, "the project period")
  );
  const exclusivityText = contractData.exclusivity
    ? `Creator agrees not to work with direct competitors for ${exclusivityDuration}.`
    : "No exclusivity obligations apply unless otherwise agreed in writing.";

  const paymentTerms =
    paymentStructure === "upfront_full"
      ? "100% due upfront before work starts."
      : paymentStructure === "upfront_partial"
        ? `${upfrontPaymentPercent}% due upfront, remaining balance due on final delivery.`
        : paymentStructure === "milestone"
          ? "Payment will be made in agreed milestones tied to deliverable stages."
          : "Payment is due upon completion and delivery approval.";

  const riskWarnings = buildRiskWarnings(contractData);

  return [
    {
      title: "1. Parties",
      body: `This Client Service Agreement (the \"Agreement\") is entered into on ${effectiveDate} between ${companyName} (represented by ${companyRepresentative}) and the Creator (${creator}). This agreement is based on the ${template.name} template selected by the Company.`,
    },
    {
      title: "2. Scope of Work",
      body: `Creator will produce and deliver services on ${platform}. Deliverables: ${deliverablesList}. Services must be provided professionally and in line with the approved brief.`,
    },
    {
      title: "3. Project Timeline",
      body: `The project period starts on ${campaignStart} and ends on ${campaignEnd}. All deliverables must be submitted within this period unless both parties approve a revised schedule in writing.`,
    },
    {
      title: "4. Compensation",
      body: `Company will pay Creator ${paymentAmount} ${paymentCurrency}. Payment structure: ${paymentTerms} Final payment deadline: within ${paymentDeadlineDays} days from valid invoice.`,
    },
    {
      title: "5. Late Payment & Penalties",
      body: `Late invoices incur a ${latePaymentPenaltyPercent}% penalty per month (or maximum permitted by law). If the project is cancelled by Company after work starts, Creator is owed a kill fee of ${killFeePercent}% of remaining contract value plus payment for completed work.`,
    },
    {
      title: "6. Usage License",
      body: `Usage rights granted to Company: ${usageRights}. Usage duration: ${usageDuration}. Any use beyond this duration or scope requires Creator's prior written approval.`,
    },
    {
      title: "7. Revisions & Approval Deadlines",
      body: `Contract includes ${revisions} revision round(s). Creator will deliver each revision within ${revisionTurnaroundDays} days after receiving consolidated feedback. Company must approve or request changes within ${approvalDeadlineDays} days of each submission, otherwise deliverables are deemed approved.`,
    },
    {
      title: "8. Posting Requirements",
      body: `Posting or publication requirements: ${postingRequirements}. Any timeline, tagging, disclosure, and brand safety rules must be documented here and mutually approved.`,
    },
    {
      title: "9. Exclusivity",
      body: exclusivityText,
    },
    {
      title: "10. Intellectual Property",
      body: "Creator retains ownership of all intellectual property and underlying creative assets unless explicitly assigned in writing. Company receives only the license rights set in Section 6.",
    },
    {
      title: "11. Confidentiality",
      body: "Both parties agree to keep confidential any non-public business, project, pricing, or strategic information received during this engagement. This obligation survives termination of the Agreement.",
    },
    {
      title: "12. Limitation of Liability",
      body: "Neither party shall be liable for indirect, incidental, consequential, or punitive damages arising from this Agreement. Each party's total liability is limited to the fees paid or owed under this Agreement.",
    },
    {
      title: "13. Force Majeure",
      body: "Neither party shall be liable for failure to perform obligations due to unforeseeable circumstances beyond reasonable control, including natural disasters, pandemics, government actions, or acts of God. The affected party must provide written notice and make reasonable efforts to resume performance.",
    },
    {
      title: "14. Dispute Resolution",
      body: "Disputes shall be resolved through good faith negotiation. If negotiation fails, disputes will be resolved through binding arbitration or mediation as mutually agreed, under the rules of the jurisdiction where the Company resides. Both parties waive the right to jury trial.",
    },
    {
      title: "15. Termination",
      body: "Either party may terminate this Agreement for material breach if the breach is not cured within 14 days of written notice. Upon termination, completed and approved work remains payable, and all confidentiality obligations survive termination.",
    },
    {
      title: "16. Entire Agreement",
      body: "This Agreement, including all referenced templates and attachments, constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, and agreements. Any amendments must be made in writing and signed by both parties.",
    },
    {
      title: "17. Risk Warnings",
      body:
        riskWarnings.length > 0
          ? `Potential risk flags: ${riskWarnings.join(" ")}`
          : "No critical contractual risk flags detected from the current agreement inputs.",
    },
    {
      title: "18. Acceptance",
      body: "By approving this Agreement, both parties confirm they have read, understood, and agreed to the terms stated above. Electronic signatures are binding and equivalent to original signatures.",
    },
  ];
}
