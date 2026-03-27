import { z } from "zod";

import type {
  ContractData,
  ContractTemplateId,
  ContractUsageRights,
} from "@/app/types/contracts";

const contractTemplateIds = ["blank", "instagram", "tiktok", "youtube", "blog"] as const;
const usageRightsValues = ["organic_only", "paid_ads", "full_buyout"] as const;

const contractDataSchema = z.object({
  contractTemplate: z.enum(contractTemplateIds),
  clientEmail: z.string().trim().default(""),
  brandName: z.string().trim().default(""),
  platform: z.string().trim().default(""),
  deliverables: z.string().trim().default(""),
  campaignStartDate: z.string().trim().default(""),
  campaignEndDate: z.string().trim().default(""),
  paymentAmount: z.string().trim().default(""),
  currency: z.string().trim().default("USD"),
  paymentDeadlineDays: z.string().trim().default("30"),
  usageRights: z.enum(usageRightsValues).default("organic_only"),
  revisions: z.string().trim().default("1"),
  exclusivity: z.boolean().default(false),
  exclusivityDuration: z.string().trim().default(""),
});

function asTrimmedString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function asTemplateId(value: unknown): ContractTemplateId {
  return contractTemplateIds.includes(value as ContractTemplateId)
    ? (value as ContractTemplateId)
    : "blank";
}

function asUsageRights(value: unknown): ContractUsageRights {
  return usageRightsValues.includes(value as ContractUsageRights)
    ? (value as ContractUsageRights)
    : "organic_only";
}

export function normalizeContractData(
  input: Partial<ContractData> | null | undefined,
  clientEmail: string
): ContractData {
  return contractDataSchema.parse({
    contractTemplate: asTemplateId(input?.contractTemplate),
    clientEmail: asTrimmedString(input?.clientEmail, clientEmail) || clientEmail,
    brandName: asTrimmedString(input?.brandName),
    platform: asTrimmedString(input?.platform),
    deliverables: asTrimmedString(input?.deliverables),
    campaignStartDate: asTrimmedString(input?.campaignStartDate),
    campaignEndDate: asTrimmedString(input?.campaignEndDate),
    paymentAmount: asTrimmedString(input?.paymentAmount),
    currency: asTrimmedString(input?.currency, "USD") || "USD",
    paymentDeadlineDays: asTrimmedString(input?.paymentDeadlineDays, "30") || "30",
    usageRights: asUsageRights(input?.usageRights),
    revisions: asTrimmedString(input?.revisions, "1") || "1",
    exclusivity: Boolean(input?.exclusivity),
    exclusivityDuration: asTrimmedString(input?.exclusivityDuration),
  });
}

export function createEmptyContractData(clientEmail = "") {
  return normalizeContractData({}, clientEmail);
}

export function parseContractData(input: unknown, clientEmail: string) {
  return normalizeContractData((input as Partial<ContractData> | null | undefined) ?? {}, clientEmail);
}