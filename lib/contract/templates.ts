import type { ContractData, ContractTemplateId } from "@/app/types/contracts";

export type ContractTemplate = {
  id: ContractTemplateId;
  name: string;
  description: string;
  icon: string;
  color: string;
  defaults: Partial<ContractData>;
};

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: "blank",
    name: "Blank",
    description: "Start from scratch",
    icon: "✏️",
    color: "#64748b",
    defaults: {},
  },
  {
    id: "instagram",
    name: "Social Media Campaign",
    description: "Creator/influencer deliverables",
    icon: "📱",
    color: "#e11d48",
    defaults: {
      platform: "Instagram",
      deliverables: "1 feed post, 3 stories, and 1 short-form video",
      usageRights: "organic_only",
      revisions: "1",
      paymentDeadlineDays: "30",
      exclusivity: false,
      exclusivityDuration: "",
    },
  },
  {
    id: "tiktok",
    name: "One-Time Project",
    description: "Fixed scope and deliverables",
    icon: "🧩",
    color: "#0f766e",
    defaults: {
      platform: "Project-based",
      deliverables: "Defined project scope with milestones and final handoff",
      usageRights: "organic_only",
      revisions: "2",
      paymentDeadlineDays: "30",
      exclusivity: false,
      exclusivityDuration: "",
    },
  },
  {
    id: "youtube",
    name: "Consulting Agreement",
    description: "Advisory sessions and strategy",
    icon: "💼",
    color: "#7c3aed",
    defaults: {
      platform: "Consulting",
      deliverables: "Strategic consulting sessions, documentation, and recommendations",
      usageRights: "organic_only",
      revisions: "1",
      paymentDeadlineDays: "7",
      exclusivity: false,
      exclusivityDuration: "",
    },
  },
  {
    id: "blog",
    name: "Licensing Agreement",
    description: "Usage and rights terms",
    icon: "📄",
    color: "#ea580c",
    defaults: {
      platform: "Licensing",
      deliverables: "Licensed assets, allowed usage scope, and duration terms",
      usageRights: "full_buyout",
      revisions: "1",
      paymentDeadlineDays: "30",
      exclusivity: false,
      exclusivityDuration: "",
    },
  },
];

export function getContractTemplateById(templateId: ContractTemplateId) {
  return CONTRACT_TEMPLATES.find((template) => template.id === templateId) ?? CONTRACT_TEMPLATES[0];
}