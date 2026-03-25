"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { ContractData } from "@/app/types/contracts";

type ContractReviewClientProps = {
  publicToken: string;
  initialStatus: string;
  initialFeedback: string | null;
  clientEmail: string;
  influencerEmail: string | null;
  createdAt: string;
  contractData: ContractData;
};

function labelForStatus(status: string) {
  if (status === "pending") return "Pending";
  if (status === "signed") return "Completed";
  if (status === "needs_changes") return "Needs Changes";
  if (status === "changes_requested") return "Needs Changes";
  if (status === "accepted") return "Accepted";
  if (status === "completed") return "Completed";
  if (status === "updated") return "Updated";
  if (status === "viewed") return "Viewed";
  return "Pending";
}

export default function ContractReviewClient(props: ContractReviewClientProps) {
  const router = useRouter();
  const [form, setForm] = useState<ContractData>(props.contractData);
  const [feedback, setFeedback] = useState(props.initialFeedback || "");
  const [status, setStatus] = useState(props.initialStatus);
  const [loadingAction, setLoadingAction] = useState<"request_changes" | "accept" | "send_updated" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isCompleted = useMemo(() => status === "completed", [status]);
  const canSendUpdatedContract = useMemo(() => status === "changes_requested", [status]);

  const handleFormChange =
    (key: keyof ContractData) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const nextValue =
        key === "exclusivity"
          ? (event.target as HTMLInputElement).checked
          : event.target.value;

      setForm((current) => ({
        ...current,
        [key]: nextValue,
      }));
    };

  const submitAction = async (action: "request_changes" | "accept") => {
    setLoadingAction(action);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/contract/${props.publicToken}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          feedback,
          contractData: form,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.message || "Request failed");
        return;
      }

      if (action === "request_changes") {
        setStatus("changes_requested");
        setSuccess("Your requested edits were sent back to the brand.");
      } else {
        setStatus("completed");
        setSuccess("Contract accepted. Final PDF was emailed to both you and the brand.");
      }

      router.refresh();
    } finally {
      setLoadingAction(null);
    }
  };

  const sendUpdatedContract = async () => {
    setLoadingAction("send_updated");
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/contract/${props.publicToken}/resend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contractData: form,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.message || "Failed to send updated contract");
        return;
      }

      setStatus("updated");
      setSuccess("Updated contract sent. The creator has been notified by email.");
      router.refresh();
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        color: "#0f172a",
        padding: "32px 16px",
      }}
    >
      <section
        style={{
          maxWidth: "920px",
          margin: "0 auto",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 12px 30px rgba(2, 6, 23, 0.06)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "30px", lineHeight: 1.1 }}>
              {form.brandName || "Contract"}
            </h1>
            <p style={{ marginTop: "8px", color: "#475569" }}>
              Review the campaign terms, request edits, or approve the agreement.
            </p>
          </div>
          <div
            style={{
              height: "fit-content",
              padding: "8px 12px",
              borderRadius: "999px",
              border: "1px solid #bfdbfe",
              background: "#eff6ff",
              color: "#1e3a8a",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontWeight: 600,
            }}
          >
            {labelForStatus(status)}
          </div>
        </div>

        <div style={{ marginTop: "18px", display: "grid", gap: "10px" }}>
          <div><strong>From brand:</strong> {props.influencerEmail || "Unknown"}</div>
          <div><strong>For creator:</strong> {props.clientEmail}</div>
          <div><strong>Created:</strong> {new Date(props.createdAt).toLocaleDateString()}</div>
        </div>

        <div style={{ marginTop: "24px", display: "grid", gap: "14px" }}>
          <label style={{ display: "grid", gap: "6px" }}>
            Brand name
            <input value={form.brandName} onChange={handleFormChange("brandName")} disabled={isCompleted} style={{ padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px" }} />
          </label>

          <label style={{ display: "grid", gap: "6px" }}>
            Platform
            <input value={form.platform} onChange={handleFormChange("platform")} disabled={isCompleted} style={{ padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px" }} />
          </label>

          <label style={{ display: "grid", gap: "6px" }}>
            Deliverables
            <textarea value={form.deliverables} onChange={handleFormChange("deliverables")} disabled={isCompleted} style={{ minHeight: "90px", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px" }} />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <label style={{ display: "grid", gap: "6px" }}>
              Campaign start
              <input type="date" value={form.campaignStartDate} onChange={handleFormChange("campaignStartDate")} disabled={isCompleted} style={{ padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px" }} />
            </label>
            <label style={{ display: "grid", gap: "6px" }}>
              Campaign end
              <input type="date" value={form.campaignEndDate} onChange={handleFormChange("campaignEndDate")} disabled={isCompleted} style={{ padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px" }} />
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <label style={{ display: "grid", gap: "6px" }}>
              Payment amount
              <input type="number" value={form.paymentAmount} onChange={handleFormChange("paymentAmount")} disabled={isCompleted} style={{ padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px" }} />
            </label>
            <label style={{ display: "grid", gap: "6px" }}>
              Currency
              <input value={form.currency} onChange={handleFormChange("currency")} disabled={isCompleted} style={{ padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px" }} />
            </label>
            <label style={{ display: "grid", gap: "6px" }}>
              Payment deadline (days)
              <input type="number" value={form.paymentDeadlineDays} onChange={handleFormChange("paymentDeadlineDays")} disabled={isCompleted} style={{ padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px" }} />
            </label>
          </div>

          <label style={{ display: "grid", gap: "6px" }}>
            Notes / Requested changes
            <textarea
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              disabled={isCompleted}
              style={{ minHeight: "110px", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
              placeholder="Describe changes you want before approval"
            />
          </label>
        </div>

        {error && <p style={{ color: "#b91c1c", marginTop: "16px" }}>{error}</p>}
        {success && <p style={{ color: "#166534", marginTop: "16px" }}>{success}</p>}

        {!isCompleted && (
          <div style={{ marginTop: "20px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {canSendUpdatedContract ? (
              <button
                type="button"
                onClick={sendUpdatedContract}
                disabled={Boolean(loadingAction)}
                style={{
                  border: "1px solid #2563eb",
                  background: "#dbeafe",
                  color: "#1d4ed8",
                  borderRadius: "999px",
                  padding: "10px 18px",
                  fontWeight: 700,
                }}
              >
                {loadingAction === "send_updated" ? "Sending update..." : "Send updated contract"}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => submitAction("request_changes")}
                  disabled={Boolean(loadingAction)}
                  style={{
                    border: "1px solid #f59e0b",
                    background: "#fffbeb",
                    color: "#92400e",
                    borderRadius: "999px",
                    padding: "10px 18px",
                    fontWeight: 600,
                  }}
                >
                  {loadingAction === "request_changes" ? "Submitting..." : "Request edits"}
                </button>

                <button
                  type="button"
                  onClick={() => submitAction("accept")}
                  disabled={Boolean(loadingAction)}
                  style={{
                    border: "1px solid #16a34a",
                    background: "#dcfce7",
                    color: "#166534",
                    borderRadius: "999px",
                    padding: "10px 18px",
                    fontWeight: 700,
                  }}
                >
                  {loadingAction === "accept" ? "Finalizing..." : "Accept contract"}
                </button>
              </>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
