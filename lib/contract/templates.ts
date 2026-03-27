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
    name: "Instagram",
    description: "Feed posts, Reels & Stories",
    icon: "📸",
    color: "#e1306c",
    defaults: {
      platform: "Instagram",
      deliverables: "1 Instagram Feed Post, 3 Instagram Stories, 1 Reel",
      usageRights: "organic_only",
      revisions: "1",
      paymentDeadlineDays: "30",
      exclusivity: false,
      exclusivityDuration: "",
    },
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: "Short-form video content",
    icon: "🎬",
    color: "#010101",
    defaults: {
      platform: "TikTok",
      deliverables: "2 TikTok videos (min. 30 seconds each)",
      usageRights: "organic_only",
      revisions: "2",
      paymentDeadlineDays: "30",
      exclusivity: false,
      exclusivityDuration: "",
    },
  },
  {
    id: "youtube",
    name: "YouTube",
    description: "Dedicated video or integration",
    icon: "▶️",
    color: "#ff0000",
    defaults: {
      platform: "YouTube",
      deliverables: "1 dedicated YouTube video (min. 10 min) with product integration",
      usageRights: "paid_ads",
      revisions: "2",
      paymentDeadlineDays: "14",
      exclusivity: false,
      exclusivityDuration: "",
    },
  },
  {
    id: "blog",
    name: "Blog",
    description: "Written article or review",
    icon: "📝",
    color: "#10b981",
    defaults: {
      platform: "Blog",
      deliverables: "1 sponsored blog article (min. 800 words) with product review",
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