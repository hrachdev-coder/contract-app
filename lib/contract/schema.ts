import { z } from "zod";

import type {
  ContractData,
  ContractDurationUnit,
  ContractPaymentStructure,
  ContractTemplateId,
  ContractUsageRights,
} from "@/app/types/contracts";

const contractTemplateIds = ["blank", "instagram", "tiktok", "youtube", "blog"] as const;
const usageRightsValues = ["organic_only", "paid_ads", "full_buyout"] as const;
const durationUnits = ["days", "weeks", "months", "years"] as const;
const paymentStructureValues = [
  "on_delivery",
  "upfront_full",
  "upfront_partial",
  "milestone",
] as const;

const contractDataSchema = z.object({
  contractTemplate: z.enum(contractTemplateIds),
  clientEmail: z.string().trim().default(""),
  brandName: z.string().trim().default(""),
  platform: z.string().trim().default(""),
  deliverables: z.string().trim().default(""),
  deliverablesItems: z.array(z.string().trim().min(1)).default([]),
  campaignStartDate: z.string().trim().default(""),
  campaignEndDate: z.string().trim().default(""),
  paymentAmount: z.string().trim().default(""),
  currency: z.string().trim().default("USD"),
  paymentStructure: z.enum(paymentStructureValues).default("on_delivery"),
  upfrontPaymentPercent: z.string().trim().default("0"),
  paymentDeadlineDays: z.string().trim().default("30"),
  latePaymentPenaltyPercent: z.string().trim().default("0"),
  killFeePercent: z.string().trim().default("0"),
  usageRights: z.enum(usageRightsValues).default("organic_only"),
  usageDurationValue: z.string().trim().default("12"),
  usageDurationUnit: z.enum(durationUnits).default("months"),
  revisions: z.string().trim().default("1"),
  revisionTurnaroundDays: z.string().trim().default("5"),
  approvalDeadlineDays: z.string().trim().default("7"),
  postingRequirements: z.string().trim().default(""),
  exclusivity: z.boolean().default(false),
  exclusivityDurationValue: z.string().trim().default("0"),
  exclusivityDurationUnit: z.enum(durationUnits).default("months"),
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

function asDurationUnit(value: unknown): ContractDurationUnit {
  return durationUnits.includes(value as ContractDurationUnit)
    ? (value as ContractDurationUnit)
    : "months";
}

function asPaymentStructure(value: unknown): ContractPaymentStructure {
  return paymentStructureValues.includes(value as ContractPaymentStructure)
    ? (value as ContractPaymentStructure)
    : "on_delivery";
}

function toDeliverablesArray(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
      .filter(Boolean);
  }

  const raw = asTrimmedString(value);
  if (!raw) return [];

  return raw
    .split(/\n|,|;/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseLegacyDuration(value: string) {
  const match = value.trim().match(/^(\d+)\s*(day|days|week|weeks|month|months|year|years)$/i);
  if (!match) return null;

  const normalized = match[2].toLowerCase();
  const unit: ContractDurationUnit = normalized.startsWith("day")
    ? "days"
    : normalized.startsWith("week")
      ? "weeks"
      : normalized.startsWith("year")
        ? "years"
        : "months";

  return {
    value: match[1],
    unit,
  };
}

export function normalizeContractData(
  input: Partial<ContractData> | null | undefined,
  clientEmail: string
): ContractData {
  const normalizedDeliverables = toDeliverablesArray(input?.deliverablesItems ?? input?.deliverables);
  const legacyExclusivity = parseLegacyDuration(asTrimmedString(input?.exclusivityDuration));

  return contractDataSchema.parse({
    contractTemplate: asTemplateId(input?.contractTemplate),
    clientEmail: asTrimmedString(input?.clientEmail, clientEmail) || clientEmail,
    brandName: asTrimmedString(input?.brandName),
    platform: asTrimmedString(input?.platform),
    deliverables: asTrimmedString(input?.deliverables),
    deliverablesItems: normalizedDeliverables,
    campaignStartDate: asTrimmedString(input?.campaignStartDate),
    campaignEndDate: asTrimmedString(input?.campaignEndDate),
    paymentAmount: asTrimmedString(input?.paymentAmount),
    currency: asTrimmedString(input?.currency, "USD") || "USD",
    paymentStructure: asPaymentStructure(input?.paymentStructure),
    upfrontPaymentPercent: asTrimmedString(input?.upfrontPaymentPercent, "0") || "0",
    paymentDeadlineDays: asTrimmedString(input?.paymentDeadlineDays, "30") || "30",
    latePaymentPenaltyPercent: asTrimmedString(input?.latePaymentPenaltyPercent, "0") || "0",
    killFeePercent: asTrimmedString(input?.killFeePercent, "0") || "0",
    usageRights: asUsageRights(input?.usageRights),
    usageDurationValue: asTrimmedString(input?.usageDurationValue, "12") || "12",
    usageDurationUnit: asDurationUnit(input?.usageDurationUnit),
    revisions: asTrimmedString(input?.revisions, "1") || "1",
    revisionTurnaroundDays: asTrimmedString(input?.revisionTurnaroundDays, "5") || "5",
    approvalDeadlineDays: asTrimmedString(input?.approvalDeadlineDays, "7") || "7",
    postingRequirements: asTrimmedString(input?.postingRequirements),
    exclusivity: Boolean(input?.exclusivity),
    exclusivityDurationValue:
      asTrimmedString(input?.exclusivityDurationValue, legacyExclusivity?.value || "0") ||
      legacyExclusivity?.value ||
      "0",
    exclusivityDurationUnit: asDurationUnit(input?.exclusivityDurationUnit || legacyExclusivity?.unit),
    exclusivityDuration: asTrimmedString(input?.exclusivityDuration),
  });
}

export function createEmptyContractData(clientEmail = "") {
  return normalizeContractData({}, clientEmail);
}

export function parseContractData(input: unknown, clientEmail: string) {
  return normalizeContractData((input as Partial<ContractData> | null | undefined) ?? {}, clientEmail);
}