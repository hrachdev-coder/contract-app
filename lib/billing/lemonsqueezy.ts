import { createHmac, timingSafeEqual } from "crypto";
import { getConfiguredAppUrl } from "@/lib/app-url";

const LEMON_SQUEEZY_API_URL = "https://api.lemonsqueezy.com/v1/checkouts";

export type BillingPlanId = "start" | "pro" | "business";

const BILLING_PLAN_ORDER: BillingPlanId[] = ["start", "pro", "business"];

export type BillingSubscriptionStatus =
  | "active"
  | "on_trial"
  | "paused"
  | "past_due"
  | "unpaid"
  | "cancelled"
  | "expired"
  | "inactive";

type LemonSqueezyConfig = {
  apiKey: string;
  storeId: string;
  variantIds: Partial<Record<BillingPlanId, string>>;
  appUrl: string;
  testMode: boolean;
};

export type LemonSqueezySubscriptionRecord = {
  userId: string;
  subscriptionId: string;
  customerId: string | null;
  orderId: string | null;
  productId: string | null;
  variantId: string | null;
  status: BillingSubscriptionStatus;
  statusFormatted: string | null;
  planName: string | null;
  customerEmail: string | null;
  renewsAt: string | null;
  endsAt: string | null;
  trialEndsAt: string | null;
  updatePaymentMethodUrl: string | null;
  customerPortalUrl: string | null;
  rawEvent: Record<string, unknown>;
};

type LemonSqueezyWebhookPayload = {
  meta?: {
    event_name?: string;
    custom_data?: Record<string, unknown>;
  };
  data?: {
    id?: string | number;
    type?: string;
    attributes?: Record<string, unknown>;
  };
};

type CreateCheckoutOptions = {
  email?: string | null;
  name?: string | null;
  userId?: string | null;
  planId?: BillingPlanId;
  redirectPath?: string;
  cancelPath?: string;
};

type LemonSqueezyCheckoutResponse = {
  data?: {
    attributes?: {
      url?: string;
    };
  };
  errors?: Array<{
    detail?: string;
    title?: string;
  }>;
};

function getBaseAppUrl() {
  return getConfiguredAppUrl();
}

function getWebhookSecret() {
  return process.env.LEMONSQUEEZY_WEBHOOK_SECRET || null;
}

function asString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function getVariantIds() {
  const start = process.env.LEMONSQUEEZY_VARIANT_ID_START || null;
  const pro = process.env.LEMONSQUEEZY_VARIANT_ID_PRO || process.env.LEMONSQUEEZY_VARIANT_ID || null;
  const business = process.env.LEMONSQUEEZY_VARIANT_ID_BUSINESS || null;

  return {
    start: start || undefined,
    pro: pro || undefined,
    business: business || undefined,
  } satisfies Partial<Record<BillingPlanId, string>>;
}

function asStatus(value: unknown): BillingSubscriptionStatus {
  if (
    value === "active" ||
    value === "on_trial" ||
    value === "paused" ||
    value === "past_due" ||
    value === "unpaid" ||
    value === "cancelled" ||
    value === "expired"
  ) {
    return value;
  }

  return "inactive";
}

function readCustomUserId(payload: LemonSqueezyWebhookPayload, attributes: Record<string, unknown>) {
  const metaUserId = payload.meta?.custom_data?.user_id;
  if (typeof metaUserId === "string" && metaUserId.length > 0) {
    return metaUserId;
  }

  const attributeCustomData = attributes.custom_data;
  if (attributeCustomData && typeof attributeCustomData === "object") {
    const nestedUserId = (attributeCustomData as Record<string, unknown>).user_id;
    if (typeof nestedUserId === "string" && nestedUserId.length > 0) {
      return nestedUserId;
    }
  }

  return null;
}

export function getLemonSqueezyConfig(): LemonSqueezyConfig | null {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const variantIds = getVariantIds();

  if (!apiKey || !storeId || Object.keys(variantIds).length === 0) {
    return null;
  }

  return {
    apiKey,
    storeId,
    variantIds,
    appUrl: getBaseAppUrl(),
    testMode: process.env.LEMONSQUEEZY_TEST_MODE === "true",
  };
}

export function isBillingPlanId(value: string | null | undefined): value is BillingPlanId {
  return value === "start" || value === "pro" || value === "business";
}

export function getConfiguredBillingPlans() {
  const config = getLemonSqueezyConfig();

  if (!config) {
    return [] as BillingPlanId[];
  }

  return BILLING_PLAN_ORDER.filter((planId) => Boolean(config.variantIds[planId]));
}

export function getDefaultBillingPlan() {
  const configuredPlans = getConfiguredBillingPlans();

  if (configuredPlans.includes("pro")) {
    return "pro" as BillingPlanId;
  }

  return configuredPlans[0] || null;
}

export function isLemonSqueezyEnabled() {
  return Boolean(getLemonSqueezyConfig());
}

export function isBillingPlanConfigured(planId: BillingPlanId) {
  const config = getLemonSqueezyConfig();
  return Boolean(config?.variantIds[planId]);
}

export function isPaidSubscriptionStatus(status: string | null | undefined) {
  return status === "active" || status === "on_trial";
}

export function isLemonSqueezyWebhookConfigured() {
  return Boolean(getWebhookSecret());
}

export function verifyLemonSqueezySignature(rawBody: string, signature: string | null) {
  const secret = getWebhookSecret();

  if (!secret || !signature) {
    return false;
  }

  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
  const signatureBuffer = Buffer.from(signature, "utf8");
  const digestBuffer = Buffer.from(digest, "utf8");

  if (signatureBuffer.length !== digestBuffer.length) {
    return false;
  }

  return timingSafeEqual(signatureBuffer, digestBuffer);
}

export function parseLemonSqueezyWebhook(rawBody: string) {
  return JSON.parse(rawBody) as LemonSqueezyWebhookPayload;
}

export function extractSubscriptionRecord(payload: LemonSqueezyWebhookPayload): LemonSqueezySubscriptionRecord | null {
  if (!payload.data || payload.data.type !== "subscriptions") {
    return null;
  }

  const attributes = payload.data.attributes || {};
  const userId = readCustomUserId(payload, attributes);
  const subscriptionId = payload.data.id != null ? String(payload.data.id) : null;

  if (!subscriptionId || !userId) {
    return null;
  }

  const firstItem =
    attributes.first_subscription_item && typeof attributes.first_subscription_item === "object"
      ? (attributes.first_subscription_item as Record<string, unknown>)
      : null;

  const urls =
    attributes.urls && typeof attributes.urls === "object"
      ? (attributes.urls as Record<string, unknown>)
      : null;

  return {
    userId,
    subscriptionId,
    customerId: asString(attributes.customer_id),
    orderId: asString(attributes.order_id),
    productId: asString(attributes.product_id),
    variantId: asString(firstItem?.variant_id ?? attributes.variant_id),
    status: asStatus(attributes.status),
    statusFormatted: asString(attributes.status_formatted),
    planName: asString(attributes.variant_name) || asString(attributes.product_name),
    customerEmail: asString(attributes.user_email),
    renewsAt: asString(attributes.renews_at),
    endsAt: asString(attributes.ends_at),
    trialEndsAt: asString(attributes.trial_ends_at),
    updatePaymentMethodUrl: asString(urls?.update_payment_method),
    customerPortalUrl: asString(urls?.customer_portal),
    rawEvent: payload as unknown as Record<string, unknown>,
  };
}

export async function createLemonSqueezyCheckout(options: CreateCheckoutOptions = {}) {
  const config = getLemonSqueezyConfig();

  if (!config) {
    throw new Error("LemonSqueezy is not configured.");
  }

  const fallbackPlanId = getDefaultBillingPlan();
  const planId = options.planId || fallbackPlanId;

  if (!planId) {
    throw new Error("No LemonSqueezy plans are configured.");
  }

  const variantId = config.variantIds[planId];

  if (!variantId) {
    throw new Error(`The ${planId} plan is not configured in LemonSqueezy.`);
  }

  const response = await fetch(LEMON_SQUEEZY_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: options.email || undefined,
            name: options.name || undefined,
            custom: {
              user_id: options.userId || undefined,
            },
          },
          checkout_options: {
            embed: false,
            media: true,
            logo: true,
          },
          product_options: {
            redirect_url: `${config.appUrl}${options.redirectPath || "/dashboard"}`,
            receipt_button_text: "Back to Contrakt",
            receipt_link_url: `${config.appUrl}${options.redirectPath || "/dashboard"}`,
            receipt_thank_you_note: "Your Contrakt plan is now active.",
          },
          expires_at: null,
          preview: false,
          test_mode: config.testMode,
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: config.storeId,
            },
          },
          variant: {
            data: {
              type: "variants",
              id: variantId,
            },
          },
        },
      },
    }),
  });

  const payload = (await response.json().catch(() => null)) as LemonSqueezyCheckoutResponse | null;

  if (!response.ok) {
    const message = payload?.errors?.[0]?.detail || payload?.errors?.[0]?.title || "Unable to create LemonSqueezy checkout.";
    throw new Error(message);
  }

  const checkoutUrl = payload?.data?.attributes?.url;

  if (!checkoutUrl) {
    throw new Error("LemonSqueezy checkout URL was not returned.");
  }

  return checkoutUrl;
}