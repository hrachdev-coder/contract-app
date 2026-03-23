"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { ContractData, ContractStatus } from "@/app/types/contracts";

type ContractRow = {
  id: string;
  public_token: string;
  status: ContractStatus;
  feedback: string | null;
  client_email: string;
  influencer_email: string;
  contract_data: ContractData;
};

export default function ContractReviewClient({
  contract,
}: {
  contract: ContractRow;
}) {
  const router = useRouter();
  const publicToken = contract.public_token;
  const status = contract.status;
  const contractData = contract.contract_data;

  const [feedback, setFeedback] = useState<string>(contract.feedback ?? "");
  const [loading, setLoading] = useState<null | "accept" | "request">(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const showActions = useMemo(() => {
    return status === "sent" || status === "viewed" || status === "updated";
  }, [status]);

  const handleAccept = async () => {
    setError(null);
    setLoading("accept");
    try {
      const res = await fetch(`/api/contract/${publicToken}/accept`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message || "Accept failed");
        return;
      }

      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  const handleRequestChanges = async () => {
    setError(null);
    setLoading("request");
    try {
      const res = await fetch(
        `/api/contract/${publicToken}/request-changes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feedback }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message || "Request changes failed");
        return;
      }

      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {contractData.brandName || "Contract"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Client: {contract.client_email}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Status: {status}
          </p>
        </div>

        <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">
            Contract Details
          </h2>

          <div className="grid grid-cols-1 gap-3 text-sm text-gray-700">
            <div>
              <span className="font-medium text-gray-900">Employer:</span>{" "}
              {contract.influencer_email}
            </div>
            <div>
              <span className="font-medium text-gray-900">Platform:</span>{" "}
              {contractData.platform}
            </div>
            <div>
              <span className="font-medium text-gray-900">Deliverables:</span>{" "}
              {contractData.deliverables}
            </div>
            <div>
              <span className="font-medium text-gray-900">Campaign:</span>{" "}
              {contractData.campaignStartDate} → {contractData.campaignEndDate}
            </div>
            <div>
              <span className="font-medium text-gray-900">Payment:</span>{" "}
              {contractData.paymentAmount} {contractData.currency}
            </div>
            <div>
              <span className="font-medium text-gray-900">Deadline:</span>{" "}
              {contractData.paymentDeadlineDays} days
            </div>
            <div>
              <span className="font-medium text-gray-900">Usage Rights:</span>{" "}
              {contractData.usageRights}
            </div>
            <div>
              <span className="font-medium text-gray-900">Revisions:</span>{" "}
              {contractData.revisions}
            </div>
            <div>
              <span className="font-medium text-gray-900">Exclusivity:</span>{" "}
              {contractData.exclusivity ? "Yes" : "No"}
              {contractData.exclusivity ? (
                <span className="ml-2">
                  ({contractData.exclusivityDuration})
                </span>
              ) : null}
            </div>
          </div>

          {contract.feedback ? (
            <div className="pt-3 border-t border-gray-200">
              <div className="text-sm font-semibold text-gray-900">
                Creator Feedback
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1">
                {contract.feedback}
              </p>
            </div>
          ) : null}
        </section>

        {showActions ? (
          <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Actions
            </h2>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleAccept}
                disabled={loading !== null}
                className="bg-green-700 text-white text-sm px-4 py-2 rounded-xl hover:bg-green-800 disabled:opacity-50"
              >
                {loading === "accept" ? "Accepting..." : "Accept"}
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-900">
                Request Changes
              </div>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                placeholder="Write requested changes..."
                className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-black"
              />
              <button
                type="button"
                onClick={handleRequestChanges}
                disabled={loading !== null}
                className="bg-orange-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-orange-700 disabled:opacity-50"
              >
                {loading === "request"
                  ? "Submitting..."
                  : "Request Changes"}
              </button>
            </div>

            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : null}
          </section>
        ) : (
          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <p className="text-sm text-gray-700">
              Current status:{" "}
              <span className="font-semibold text-gray-900">
                {status}
              </span>
            </p>

            {status === "completed" ? (
              <p className="text-sm text-gray-500 mt-2">
                Your finalized contract PDF has been generated.
              </p>
            ) : null}

            {error ? (
              <p className="text-sm text-red-600 mt-3">{error}</p>
            ) : null}
          </section>
        )}
      </main>
    </div>
  );
}

