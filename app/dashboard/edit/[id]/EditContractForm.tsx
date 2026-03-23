"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type ContractFormState = {
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

type ContractRow = {
  id: string;
  client_email?: string | null;
  contract_data?: Partial<ContractFormState> | null;
};

export default function EditContractForm({
  contract,
}: {
  contract: ContractRow;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<ContractFormState>(() => ({
    clientEmail:
      contract.contract_data?.clientEmail ??
      (contract.client_email as string) ??
      "",
    brandName: contract.contract_data?.brandName ?? "",
    platform: contract.contract_data?.platform ?? "",
    deliverables: contract.contract_data?.deliverables ?? "",
    campaignStartDate: contract.contract_data?.campaignStartDate ?? "",
    campaignEndDate: contract.contract_data?.campaignEndDate ?? "",
    paymentAmount: contract.contract_data?.paymentAmount ?? "",
    currency: contract.contract_data?.currency ?? "USD",
    paymentDeadlineDays:
      contract.contract_data?.paymentDeadlineDays ?? "30",
    usageRights: contract.contract_data?.usageRights ?? "organic_only",
    revisions: contract.contract_data?.revisions ?? "1",
    exclusivity: Boolean(contract.contract_data?.exclusivity),
    exclusivityDuration:
      contract.contract_data?.exclusivityDuration ?? "",
  }));

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

    const { error: updateError } = await supabase
      .from("contracts")
      .update({
        contract_data: form,
        status: "updated",
      })
      .eq("id", contract.id);

    if (updateError) {
      setError(updateError.message);
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
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Client</h2>
            <input
              type="email"
              name="clientEmail"
              value={form.clientEmail}
              disabled
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm bg-gray-50 text-gray-500"
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

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save changes →"}
          </button>
        </form>
      </main>
    </div>
  );
}

