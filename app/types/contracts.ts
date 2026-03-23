export type ContractStatus =
  | "sent"
  | "viewed"
  | "changes_requested"
  | "updated"
  | "accepted"
  | "completed";

export type ContractData = {
  clientEmail: string;
  brandName: string;
  platform: string;
  deliverables: string;
  campaignStartDate: string;
  campaignEndDate: string;
  paymentAmount: string;
  currency: string;
  paymentDeadlineDays: string;
  usageRights: string;
  revisions: string;
  exclusivity: boolean;
  exclusivityDuration: string;
};

