export type ContractStatus =
  | "sent"
  | "viewed"
  | "changes_requested"
  | "updated"
  | "accepted"
  | "completed";

export type ContractTemplateId =
  | "blank"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "blog";

export type ContractUsageRights =
  | "organic_only"
  | "paid_ads"
  | "full_buyout";

export type ContractDurationUnit = "days" | "weeks" | "months" | "years";

export type ContractPaymentStructure =
  | "on_delivery"
  | "upfront_full"
  | "upfront_partial"
  | "milestone";

export type ContractAcceptanceEvidence = {
  signerEmail: string;
  signerName?: string | null;
  signerTitle?: string | null;
  publicToken: string;
  acceptedAt: string;
  acceptedIp?: string | null;
  acceptedUserAgent?: string | null;
  contractHash: string;
  consentText: string;
  source: "link_review";
  version: number;
};

export type ContractData = {
  contractTemplate: ContractTemplateId;
  clientEmail: string;
  brandName: string;
  platform: string;
  deliverables: string;
  deliverablesItems: string[];
  campaignStartDate: string;
  campaignEndDate: string;
  paymentAmount: string;
  currency: string;
  paymentStructure: ContractPaymentStructure;
  upfrontPaymentPercent: string;
  paymentDeadlineDays: string;
  latePaymentPenaltyPercent: string;
  killFeePercent: string;
  usageRights: ContractUsageRights;
  usageDurationValue: string;
  usageDurationUnit: ContractDurationUnit;
  revisions: string;
  revisionTurnaroundDays: string;
  approvalDeadlineDays: string;
  postingRequirements: string;
  exclusivity: boolean;
  exclusivityDurationValue: string;
  exclusivityDurationUnit: ContractDurationUnit;
  exclusivityDuration: string;
};

