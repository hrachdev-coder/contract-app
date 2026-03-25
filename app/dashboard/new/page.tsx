"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import "../../contract-form.css";
import "../../home.css";
import HomeHeader from "../../components/HomeHeader";

type FormState = {
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

export default function NewContractPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    clientEmail: "",
    brandName: "",
    platform: "",
    deliverables: "",
    campaignStartDate: "",
    campaignEndDate: "",
    paymentAmount: "",
    currency: "USD",
    paymentDeadlineDays: "30",
    usageRights: "organic_only",
    revisions: "1",
    exclusivity: false,
    exclusivityDuration: "",
  });

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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      router.push("/login");
      return;
    }

    // Public token for link-based review (no auth required on the creator's side)
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

      const emailData = await emailRes.json().catch(() => ({}));

      if (!emailRes.ok) {
        const msg = (emailData as any)?.message || "Unknown email error";
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

  return (
    <div style={{ fontFamily: "sans-serif", background: "var(--background)", minHeight: "100vh" }}>
      <HomeHeader />
      
      <div className="contract-form-container">
        <div className="contract-form-wrapper">
          <div className="contract-form-header">
            <h1 className="contract-form-title">Create <em>Campaign Contract</em></h1>
            <p className="contract-form-subtitle">
              Prepare terms for a creator collaboration and send them for review
            </p>
          </div>

          <form onSubmit={handleSubmit} className="contract-form">
            {/* Influencer Information */}
            <div className="form-section">
              <div className="form-section-header">
                <div className="form-section-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M3 7h18M3 12h18M3 17h8M17 17h2" stroke="#3b82f6" strokeWidth="1.6" strokeLinecap="round"/>
                    <circle cx="17" cy="17" r="3" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.4"/>
                  </svg>
                </div>
                <div>
                  <h2 className="form-section-title">Influencer Information</h2>
                  <p className="form-section-subtitle">Who should review this contract?</p>
                </div>
              </div>
              
              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">Influencer Email</label>
                  <input
                    type="email"
                    name="clientEmail"
                    value={form.clientEmail}
                    onChange={handleChange}
                    required
                    placeholder="creator@example.com"
                    className="form-input"
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Brand Name</label>
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

            {/* Campaign Details */}
            <div className="form-section">
              <div className="form-section-header">
                <div className="form-section-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="16" rx="3" stroke="#10b981" strokeWidth="1.6"/>
                    <path d="M8 8h8M8 12h6M8 16h4" stroke="#10b981" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h2 className="form-section-title">Campaign Details</h2>
                  <p className="form-section-subtitle">What should the creator deliver?</p>
                </div>
              </div>
              
              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">Platform</label>
                  <select
                    name="platform"
                    value={form.platform}
                    onChange={handleChange}
                    required
                    className="form-select"
                  >
                    <option value="">Select platform</option>
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Blog">Blog</option>
                  </select>
                </div>
                <div className="form-field form-field-full">
                  <label className="form-label">Deliverables</label>
                  <textarea
                    name="deliverables"
                    value={form.deliverables}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 3 Instagram posts, 2 Reels, 1 Story series"
                    className="form-textarea"
                  />
                </div>
                <div className="form-grid-2">
                  <div className="form-field">
                    <label className="form-label">Campaign Start Date</label>
                    <input
                      type="date"
                      name="campaignStartDate"
                      value={form.campaignStartDate}
                      onChange={handleChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Campaign End Date</label>
                    <input
                      type="date"
                      name="campaignEndDate"
                      value={form.campaignEndDate}
                      onChange={handleChange}
                      required
                      className="form-input"
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
                  <p className="form-section-subtitle">Set the legal terms</p>
                </div>
              </div>
              
              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">Usage Rights</label>
                  <div className="form-radio-group">
                    <label className="form-radio-label">
                      <input
                        type="radio"
                        name="usageRights"
                        value="organic_only"
                        checked={form.usageRights === "organic_only"}
                        onChange={handleChange}
                      />
                      <div>
                        <div className="form-radio-text">Organic Only</div>
                        <div className="form-radio-description">Content appears only in your regular feed</div>
                      </div>
                    </label>
                    <label className="form-radio-label">
                      <input
                        type="radio"
                        name="usageRights"
                        value="paid_ads"
                        checked={form.usageRights === "paid_ads"}
                        onChange={handleChange}
                      />
                      <div>
                        <div className="form-radio-text">Paid Ads</div>
                        <div className="form-radio-description">Brand can use content for paid advertising</div>
                      </div>
                    </label>
                    <label className="form-radio-label">
                      <input
                        type="radio"
                        name="usageRights"
                        value="full_buyout"
                        checked={form.usageRights === "full_buyout"}
                        onChange={handleChange}
                      />
                      <div>
                        <div className="form-radio-text">Full Buyout</div>
                        <div className="form-radio-description">Brand owns all rights to the content</div>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="form-grid-2">
                  <div className="form-field">
                    <label className="form-label">Revisions Included</label>
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
                        <span>Exclusive partnership</span>
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
                      placeholder="e.g., 6 months, 1 year"
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
                    Send contract to influencer
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