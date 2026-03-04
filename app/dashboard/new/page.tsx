"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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

    // Save contract to Supabase
    const { error: insertError } = await supabase.from("contracts").insert({
      influencer_id: user.id,
      influencer_email: user.email,
      client_email: form.clientEmail,
      contract_data: form,
      status: "pending",
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.clientEmail,
          employerName: user.email,
          contractData: form,
        }),
      });

      let emailData;
try {
  emailData = await emailRes.json();
} catch (jsonError) {
  const text = await emailRes.text();
  console.error("Email response not JSON:", text, jsonError);
  setError("Contract saved but email failed: Response not JSON");
  setLoading(false);
  return;
}

if (!emailRes.ok) {
  const msg = emailData?.message || "Unknown email error";
  console.error("Email failed:", msg);
  setError("Contract saved but email failed: " + msg);
  setLoading(false);
  return;
}

      if (!emailRes.ok) {
        console.error("Email failed:", emailData);
        setError("Contract saved but email failed.");
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
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Client</h2>
            <input
              type="email"
              name="clientEmail"
              value={form.clientEmail}
              onChange={handleChange}
              required
              placeholder="Client email"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-black"
            />
            <input
              type="text"
              name="brandName"
              value={form.brandName}
              onChange={handleChange}
              required
              placeholder="Brand name"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Campaign */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Campaign</h2>
            <select
              name="platform"
              value={form.platform}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-black"
            >
              <option value="">Select platform</option>
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
              <option value="YouTube">YouTube</option>
              <option value="Blog">Blog</option>
            </select>
            <textarea
              name="deliverables"
              value={form.deliverables}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Deliverables"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-black"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                name="campaignStartDate"
                value={form.campaignStartDate}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-xl px-4 py-2 text-sm"
              />
              <input
                type="date"
                name="campaignEndDate"
                value={form.campaignEndDate}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-xl px-4 py-2 text-sm"
              />
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Payment</h2>
            <div className="grid grid-cols-3 gap-4">
              <input
                type="number"
                name="paymentAmount"
                value={form.paymentAmount}
                onChange={handleChange}
                required
                placeholder="Amount"
                className="col-span-2 border border-gray-300 rounded-xl px-4 py-2 text-sm"
              />
              <input
                type="text"
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="border border-gray-300 rounded-xl px-4 py-2 text-sm"
              />
            </div>
            <input
              type="number"
              name="paymentDeadlineDays"
              value={form.paymentDeadlineDays}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm"
            />
          </div>

          {/* Rights & Terms */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Rights & Terms</h2>
            {["organic_only", "paid_ads", "full_buyout"].map((value) => (
              <label key={value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="usageRights"
                  value={value}
                  checked={form.usageRights === value}
                  onChange={handleChange}
                />
                <span className="text-sm">{value}</span>
              </label>
            ))}
            <input
              type="number"
              name="revisions"
              value={form.revisions}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm"
            />
            <label className="flex items-center justify-between border border-gray-200 rounded-xl px-3 py-2">
              <span className="text-sm font-medium">Exclusivity</span>
              <input
                type="checkbox"
                name="exclusivity"
                checked={form.exclusivity}
                onChange={handleChange}
              />
            </label>
            {form.exclusivity && (
              <input
                type="text"
                name="exclusivityDuration"
                value={form.exclusivityDuration}
                onChange={handleChange}
                placeholder="Exclusivity duration"
                className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm"
              />
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send contract to client →"}
          </button>
        </form>
      </main>
    </div>
  );
}