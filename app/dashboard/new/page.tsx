"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { createClient, getUserOrNull } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { ContractData } from "@/app/types/contracts";
import type { User } from "@supabase/supabase-js";
import { createEmptyContractData } from "@/lib/contract/schema";
import { CONTRACT_TEMPLATES, type ContractTemplate } from "@/lib/contract/templates";
import EnglishDatePicker from "../../components/EnglishDatePicker";
import BillingPlanGrid from "../../components/BillingPlanGrid";
import "../../contract-form.css";
import "../../home.css";
import HomeHeader from "../../components/HomeHeader";
import { useEffect } from "react";
import Link from "next/link";

type UsageRightOption = {
  value: ContractData["usageRights"];
  label: string;
  description: string;
};

type RightsTermsContent = {
  sectionSubtitle: string;
  usageRightsLabel: string;
  revisionsLabel: string;
  exclusivityLabel: string;
  exclusivityDurationPlaceholder: string;
  options: UsageRightOption[];
};

const SOCIAL_RIGHTS_OPTIONS: UsageRightOption[] = [
  {
    value: "organic_only",
    label: "Organic Only",
    description: "Content appears only in regular social posts.",
  },
  {
    value: "paid_ads",
    label: "Paid Ads",
    description: "Company can run this content as paid advertising.",
  },
  {
    value: "full_buyout",
    label: "Full Buyout",
    description: "Company gets complete ownership of the delivered content.",
  },
];

const SERVICE_RIGHTS_OPTIONS: UsageRightOption[] = [
  {
    value: "organic_only",
    label: "Internal Use",
    description: "Deliverables are limited to internal or direct client use.",
  },
  {
    value: "paid_ads",
    label: "Commercial Use",
    description: "Deliverables can be used in company marketing and sales materials.",
  },
  {
    value: "full_buyout",
    label: "Full Ownership",
    description: "All rights are transferred to the company after delivery.",
  },
];

function getRightsTermsContent(templateId: ContractData["contractTemplate"]): RightsTermsContent {
  if (templateId === "instagram") {
    return {
      sectionSubtitle: "Set campaign usage, revisions, and exclusivity terms",
      usageRightsLabel: "Usage Rights",
      revisionsLabel: "Revisions Included",
      exclusivityLabel: "Exclusive partnership",
      exclusivityDurationPlaceholder: "e.g., 6 months, 1 year",
      options: SOCIAL_RIGHTS_OPTIONS,
    };
  }

  if (templateId === "blog") {
    return {
      sectionSubtitle: "Define licensing scope, ownership, and exclusivity",
      usageRightsLabel: "License Scope",
      revisionsLabel: "Amendments Included",
      exclusivityLabel: "Exclusive license",
      exclusivityDurationPlaceholder: "e.g., Perpetual, 12 months, regional term",
      options: SERVICE_RIGHTS_OPTIONS,
    };
  }

  return {
    sectionSubtitle: "Set legal terms for ownership, revisions, and exclusivity",
    usageRightsLabel: "Rights Scope",
    revisionsLabel: "Revision Rounds",
    exclusivityLabel: "Exclusive engagement",
    exclusivityDurationPlaceholder: "e.g., 3 months, project duration",
    options: SERVICE_RIGHTS_OPTIONS,
  };
}

export default function NewContractPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ContractData>(createEmptyContractData());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessLoading, setAccessLoading] = useState(true);
  const [billingConfigured, setBillingConfigured] = useState(false);
  const [hasActiveAccess, setHasActiveAccess] = useState(true);
  const [billingError, setBillingError] = useState<string | null>(null);
  const isSocialTemplate = form.contractTemplate === "instagram";
  const rightsTermsContent = getRightsTermsContent(form.contractTemplate);

  useEffect(() => {
    const checkAccess = async () => {
      const user = await getUserOrNull(supabase);

      if (!user) {
        router.push("/login");
        return;
      }

      setCurrentUser(user);

      try {
        const response = await fetch("/api/billing/subscription", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { message?: string };
          throw new Error(payload.message || "Unable to verify billing access.");
        }

        const payload = (await response.json()) as {
          configured: boolean;
          hasActiveAccess: boolean;
        };

        setBillingConfigured(payload.configured);
        setHasActiveAccess(payload.hasActiveAccess);
      } catch (nextError) {
        setBillingError(
          nextError instanceof Error ? nextError.message : "Unable to verify billing access."
        );
      } finally {
        setAccessLoading(false);
      }
    };

    void checkAccess();
  }, [router, supabase]);

  const handleDateChange =
    (key: "campaignStartDate" | "campaignEndDate") => (value: string) => {
      setForm((prev) => ({
        ...prev,
        [key]: value,
      }));
    };

  const handleTemplateSelect = (template: ContractTemplate) => {
    setForm((prev) => ({
      ...prev,
      contractTemplate: template.id,
      ...template.defaults,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.currentTarget;
    const value =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : target.value;

    setForm((prev) => ({
      ...prev,
      [target.name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (billingConfigured && !hasActiveAccess) {
      setError("An active subscription is required to create new contracts.");
      setLoading(false);
      return;
    }

    if (!form.campaignStartDate || !form.campaignEndDate) {
      setError("Please select both project start and end dates.");
      setLoading(false);
      return;
    }

    const user = currentUser || (await getUserOrNull(supabase));

    if (!user) {
      setLoading(false);
      router.push("/login");
      return;
    }

    // Public token for link-based review (no auth required on the client's side)
    const publicToken =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now()) + "-" + Math.random().toString(16).slice(2);

    // Save contract to Supabase
    const { error: insertError } = await supabase.from("contracts").insert({
      influencer_id: user.id,
      influencer_email: user.email,
      client_email: form.clientEmail,
      contract_data: form,
      status: "sent",
      public_token: publicToken,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // Send email via server-side API
    try {
      const emailRes = await fetch("/api/send-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.clientEmail,
          employerName: user.email,
          contractData: form,
          publicToken,
        }),
      });

      const emailData: { message?: string } = await emailRes
        .json()
        .catch(() => ({}));

      if (!emailRes.ok) {
        const msg = emailData.message || "Unknown email error";
        console.error("Email failed:", msg);
        setError("Contract saved but email failed: " + msg);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("Email request error:", err);
      setError("Contract saved but email failed.");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/dashboard");
  };

  if (accessLoading) {
    return (
      <div style={{ fontFamily: "sans-serif", background: "var(--background)", minHeight: "100vh" }}>
        <HomeHeader />
        <div className="contract-form-container">
          <div className="contract-form-wrapper">
            <div className="contract-form-header">
              <h1 className="contract-form-title">Checking <em>workspace access</em></h1>
              <p className="contract-form-subtitle">We are verifying your billing status before opening the contract builder.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (billingConfigured && !hasActiveAccess) {
    return (
      <div style={{ fontFamily: "sans-serif", background: "var(--background)", minHeight: "100vh" }}>
        <HomeHeader />
        <div className="contract-form-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
          <div className="contract-form-wrapper" style={{ width: "100%", maxWidth: 900, margin: "0 auto", background: "#fff", borderRadius: 18, boxShadow: "0 2px 16px #0001", padding: 32 }}>
            <div className="contract-form-header" style={{ textAlign: "center", marginBottom: 24 }}>
              <h1 className="contract-form-title" style={{ fontSize: 32, marginBottom: 8 }}>Billing Required</h1>
              <p className="contract-form-subtitle" style={{ fontSize: 18, color: "#64748b" }}>
                You need an active subscription to create new contracts.<br />
                <span style={{ fontSize: 15, color: "#b91c1c" }}>
                  {billingError ? billingError : ""}
                </span>
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
              <BillingPlanGrid
                email={currentUser?.email || null}
                name={currentUser?.email?.split("@")[0] || null}
                userId={currentUser?.id || null}
                redirectPath="/dashboard/new"
                title="Activate a plan before you <em>send contracts</em>"
                subtitle="Pick the tier that matches your current workload. Your access unlocks as soon as LemonSqueezy confirms the subscription."
              />
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Link href="/dashboard" className="btn-ghost">Back to dashboard</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "sans-serif", background: "var(--background)", minHeight: "100vh" }}>
      <HomeHeader />
      
      <div className="contract-form-container">
        <div className="contract-form-wrapper">
          <div className="contract-form-header">
            <h1 className="contract-form-title">Create <em>Campaign Contract</em></h1>
            <p className="contract-form-subtitle">
              Prepare terms for a client project and send them for review
            </p>
          </div>

          <form onSubmit={handleSubmit} className="contract-form">

            {/* Template Selector */}
            <div className="template-selector-section">
              <div className="template-selector-header">
                <h2 className="template-selector-title">Choose a template</h2>
                <p className="template-selector-subtitle">Start with a pre-filled contract or build from scratch</p>
              </div>
              <div className="template-cards">
                {CONTRACT_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    className={`template-card${form.contractTemplate === template.id ? " template-card--selected" : ""}`}
                    style={{ "--template-color": template.color } as React.CSSProperties}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <span className="template-card-icon">{template.icon}</span>
                    <span className="template-card-name">{template.name}</span>
                    <span className="template-card-desc">{template.description}</span>
                    {form.contractTemplate === template.id && (
                      <span className="template-card-check">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Client Information */}
            <div className="form-section">
              <div className="form-section-header">
                <div className="form-section-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M3 7h18M3 12h18M3 17h8M17 17h2" stroke="#3b82f6" strokeWidth="1.6" strokeLinecap="round"/>
                    <circle cx="17" cy="17" r="3" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.4"/>
                  </svg>
                </div>
                <div>
                  <h2 className="form-section-title">Client Information</h2>
                  <p className="form-section-subtitle">Who should review this contract?</p>
                </div>
              </div>
              
              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">Client Email</label>
                  <input
                    type="email"
                    name="clientEmail"
                    value={form.clientEmail}
                    onChange={handleChange}
                    required
                    placeholder="client@example.com"
                    className="form-input"
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    name="brandName"
                    value={form.brandName}
                    onChange={handleChange}
                    required
                    placeholder="Nike, Apple, etc."
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="form-section">
              <div className="form-section-header">
                <div className="form-section-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="16" rx="3" stroke="#10b981" strokeWidth="1.6"/>
                    <path d="M8 8h8M8 12h6M8 16h4" stroke="#10b981" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h2 className="form-section-title">Project Details</h2>
                  <p className="form-section-subtitle">What should be delivered in this project?</p>
                </div>
              </div>
              
              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">
                    {isSocialTemplate ? "Social Platform" : "Service Type"}
                  </label>
                  {isSocialTemplate ? (
                    <select
                      name="platform"
                      value={form.platform}
                      onChange={handleChange}
                      required
                      className="form-select"
                    >
                      <option value="">Select social platform</option>
                      <option value="Instagram">Instagram</option>
                      <option value="TikTok">TikTok</option>
                      <option value="YouTube">YouTube</option>
                      <option value="Facebook">Facebook</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="X">X (Twitter)</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="platform"
                      value={form.platform}
                      onChange={handleChange}
                      required
                      placeholder="Consulting, Design, Development, Licensing, etc."
                      className="form-input"
                    />
                  )}
                </div>
                <div className="form-field form-field-full">
                  <label className="form-label">Deliverables</label>
                  <textarea
                    name="deliverables"
                    value={form.deliverables}
                    onChange={handleChange}
                    required
                    placeholder={
                      isSocialTemplate
                        ? "e.g., 3 Instagram posts, 2 Reels, 1 Story series"
                        : "e.g., weekly strategy calls, 1 report, 2 revision rounds"
                    }
                    className="form-textarea"
                  />
                </div>
                <div className="form-grid-2">
                  <div className="form-field">
                    <label className="form-label">Project Start Date</label>
                    <EnglishDatePicker
                      value={form.campaignStartDate}
                      onChange={handleDateChange("campaignStartDate")}
                      placeholder="Select start date"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Project End Date</label>
                    <EnglishDatePicker
                      value={form.campaignEndDate}
                      onChange={handleDateChange("campaignEndDate")}
                      placeholder="Select end date"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            <div className="form-section">
              <div className="form-section-header">
                <div className="form-section-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="8" stroke="#64748b" strokeWidth="1.6"/>
                    <path d="M8 12h8M12 8v8" stroke="#64748b" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h2 className="form-section-title">Payment Terms</h2>
                  <p className="form-section-subtitle">What payment terms are you offering?</p>
                </div>
              </div>
              
              <div className="form-grid">
                <div className="form-grid-3">
                  <div className="form-field">
                    <label className="form-label">Payment Amount</label>
                    <input
                      type="number"
                      name="paymentAmount"
                      value={form.paymentAmount}
                      onChange={handleChange}
                      required
                      placeholder="2500"
                      className="form-input"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Currency</label>
                    <input
                      type="text"
                      name="currency"
                      value={form.currency}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label className="form-label">Payment Deadline (Days)</label>
                  <input
                    type="number"
                    name="paymentDeadlineDays"
                    value={form.paymentDeadlineDays}
                    onChange={handleChange}
                    placeholder="30"
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Rights & Terms */}
            <div className="form-section">
              <div className="form-section-header">
                <div className="form-section-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12h6M9 16h6M9 8h6" stroke="#d4826e" strokeWidth="1.6" strokeLinecap="round"/>
                    <rect x="4" y="4" width="16" height="16" rx="3" stroke="#d4826e" strokeWidth="1.6"/>
                  </svg>
                </div>
                <div>
                  <h2 className="form-section-title">Rights & Terms</h2>
                  <p className="form-section-subtitle">{rightsTermsContent.sectionSubtitle}</p>
                </div>
              </div>
              
              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">{rightsTermsContent.usageRightsLabel}</label>
                  <div className="form-radio-group">
                    {rightsTermsContent.options.map((option) => (
                      <label key={option.value} className="form-radio-label">
                        <input
                          type="radio"
                          name="usageRights"
                          value={option.value}
                          checked={form.usageRights === option.value}
                          onChange={handleChange}
                        />
                        <div>
                          <div className="form-radio-text">{option.label}</div>
                          <div className="form-radio-description">{option.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="form-grid-2">
                  <div className="form-field">
                    <label className="form-label">{rightsTermsContent.revisionsLabel}</label>
                    <input
                      type="number"
                      name="revisions"
                      value={form.revisions}
                      onChange={handleChange}
                      placeholder="1"
                      className="form-input"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Exclusivity</label>
                    <div className="form-checkbox-group">
                      <label className="form-checkbox-label">
                        <input
                          type="checkbox"
                          name="exclusivity"
                          checked={form.exclusivity}
                          onChange={handleChange}
                        />
                        <span>{rightsTermsContent.exclusivityLabel}</span>
                      </label>
                      <span className="form-checkbox-toggle">
                        {form.exclusivity ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {form.exclusivity && (
                  <div className="form-field">
                    <label className="form-label">Exclusivity Duration</label>
                    <input
                      type="text"
                      name="exclusivityDuration"
                      value={form.exclusivityDuration}
                      onChange={handleChange}
                      placeholder={rightsTermsContent.exclusivityDurationPlaceholder}
                      className="form-input"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="form-submit-section">
              {error && (
                <div className="form-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="form-submit"
              >
                {loading ? (
                  <>
                    <div className="form-progress-spinner"></div>
                    Sending contract...
                  </>
                ) : (
                  <>
                    Send contract to client
                    <svg className="form-submit-icon" viewBox="0 0 20 20" fill="none">
                      <path d="M3 10h14M11 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}