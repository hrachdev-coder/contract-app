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
  campaignStartDate: string;
  campaignEndDate: string;
  paymentAmount: string;
  currency: string;
  paymentDeadlineDays: string;
  usageRights: ContractUsageRights;
  revisions: string;
  exclusivity: boolean;
  exclusivityDuration: string;
};

