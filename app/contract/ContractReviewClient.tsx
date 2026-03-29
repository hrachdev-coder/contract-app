"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { ContractData } from "@/app/types/contracts";
import EnglishDatePicker from "@/app/components/EnglishDatePicker";
import { buildContractSections, formatContractDate } from "@/lib/contract/contractTerms";

const ACCEPTANCE_CONSENT_TEXT =
  "I confirm I have reviewed this agreement and agree to be legally bound by its terms.";

function deriveSignerName(email: string) {
  const localPart = email.split("@")[0] || "";
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

type ContractReviewClientProps = {
  publicToken: string;
  initialStatus: string;
  initialFeedback: string | null;
  clientEmail: string;
  senderEmail: string | null;
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
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [signerName, setSignerName] = useState(() => deriveSignerName(props.clientEmail));
  const [signerTitle, setSignerTitle] = useState("");

  const isFinalized = useMemo(() => status === "accepted" || status === "completed", [status]);
  const canSendUpdatedContract = useMemo(() => status === "changes_requested", [status]);
  const representativeName = useMemo(
    () => props.senderEmail || form.brandName || "Company Representative",
    [props.senderEmail, form.brandName]
  );
  const contractSections = useMemo(
    () =>
      buildContractSections({
        employerName: representativeName,
        clientEmail: props.clientEmail,
        contractData: form,
        createdAt: props.createdAt,
      }),
    [representativeName, props.clientEmail, props.createdAt, form]
  );

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

  const handleDateChange =
    (key: "campaignStartDate" | "campaignEndDate") => (value: string) => {
      setForm((current) => ({
        ...current,
        [key]: value,
      }));
    };

  const submitAction = async (action: "request_changes" | "accept") => {
    if (action === "accept" && !agreedToTerms) {
      setError("Please confirm the legal consent statement before accepting.");
      return;
    }

    if (action === "accept" && !signerName.trim()) {
      setError("Please enter your full legal name before signing.");
      return;
    }

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
          agreedToTerms,
          consentText: ACCEPTANCE_CONSENT_TEXT,
          signerName,
          signerTitle,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.message || "Request failed");
        return;
      }

      if (action === "request_changes") {
        setStatus("changes_requested");
        setSuccess("Your requested edits were sent back to the sender.");
      } else {
        setStatus("accepted");
        setSuccess("Contract accepted. The sender will send the final PDF.");
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
      setSuccess("Updated contract sent. The client has been notified by email.");
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
              Review the contract terms, request edits, or approve the agreement.
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
          <div><strong>From sender:</strong> {representativeName}</div>
          <div><strong>For client:</strong> {props.clientEmail}</div>
          <div><strong>Created:</strong> {formatContractDate(props.createdAt)}</div>
        </div>

        <article
          style={{
            marginTop: "24px",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "18px",
            background: "#f8fafc",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "20px" }}>Client Service Agreement</h2>
          <p style={{ marginTop: "8px", color: "#475569", lineHeight: 1.7 }}>
            This contract draft is generated from your selected terms. You can edit the fields below and the agreement text updates automatically.
          </p>

          <div style={{ marginTop: "16px", display: "grid", gap: "14px" }}>
            {contractSections.map((section) => (
              <section key={section.title}>
                <h3 style={{ margin: 0, fontSize: "15px" }}>{section.title}</h3>
                <p style={{ marginTop: "6px", marginBottom: 0, color: "#334155", lineHeight: 1.75 }}>
                  {section.body}
                </p>
              </section>
            ))}
          </div>

          <div
            style={{
              marginTop: "20px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
            }}
          >
            <div style={{ borderTop: "1px dashed #94a3b8", paddingTop: "8px", color: "#475569" }}>
              <div style={{ fontWeight: 600 }}>{representativeName}</div>
              <div>Company Representative</div>
            </div>
            <div style={{ borderTop: "1px dashed #94a3b8", paddingTop: "8px", color: "#475569" }}>
              <div style={{ fontWeight: 600 }}>{props.clientEmail}</div>
              <div>Client</div>
            </div>
          </div>
        </article>

        <h2 style={{ marginTop: "24px", marginBottom: "8px", fontSize: "20px" }}>Edit Contract Terms</h2>

        <div style={{ marginTop: "24px", display: "grid", gap: "14px" }}>
          <label style={{ display: "grid", gap: "6px" }}>
            Company name
            <input value={form.brandName} onChange={handleFormChange("brandName")} disabled={isFinalized} style={{ padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px" }} />
          </label>

          <label style={{ display: "grid", gap: "6px" }}>
            Platform
            <input value={form.platform} onChange={handleFormChange("platform")} disabled={isFinalized} style={{ padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px" }} />
          </label>

          <label style={{ display: "grid", gap: "6px" }}>
            Deliverables
            <textarea value={form.deliverables} onChange={handleFormChange("deliverables")} disabled={isFinalized} style={{ minHeight: "90px", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px" }} />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <label style={{ display: "grid", gap: "6px" }}>
              Campaign start
              <EnglishDatePicker
                value={form.campaignStartDate}
                onChange={handleDateChange("campaignStartDate")}
                disabled={isFinalized}
                placeholder="Select start date"
              />
            </label>
            <label style={{ display: "grid", gap: "6px" }}>
              Campaign end
              <EnglishDatePicker
                value={form.campaignEndDate}
                onChange={handleDateChange("campaignEndDate")}
                disabled={isFinalized}
                placeholder="Select end date"
              />
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <label style={{ display: "grid", gap: "6px" }}>
              Payment amount
              <input type="number" value={form.paymentAmount} onChange={handleFormChange("paymentAmount")} disabled={isFinalized} style={{ padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px" }} />
            </label>
            <label style={{ display: "grid", gap: "6px" }}>
              Currency
              <input value={form.currency} onChange={handleFormChange("currency")} disabled={isFinalized} style={{ padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px" }} />
            </label>
            <label style={{ display: "grid", gap: "6px" }}>
              Payment deadline (days)
              <input type="number" value={form.paymentDeadlineDays} onChange={handleFormChange("paymentDeadlineDays")} disabled={isFinalized} style={{ padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px" }} />
            </label>
          </div>

          <label style={{ display: "grid", gap: "6px" }}>
            Notes / Requested changes
            <textarea
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              disabled={isFinalized}
              style={{ minHeight: "110px", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
              placeholder="Describe changes you want before approval"
            />
          </label>
        </div>

        {error && <p style={{ color: "#b91c1c", marginTop: "16px" }}>{error}</p>}
        {success && <p style={{ color: "#166534", marginTop: "16px" }}>{success}</p>}

        {!isFinalized && (
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
                <div
                  style={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <label style={{ display: "grid", gap: "6px" }}>
                    Full legal name
                    <input
                      type="text"
                      value={signerName}
                      onChange={(event) => setSignerName(event.target.value)}
                      placeholder="Jane Doe"
                      style={{ padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
                    />
                  </label>
                  <label style={{ display: "grid", gap: "6px" }}>
                    Title / role (optional)
                    <input
                      type="text"
                      value={signerTitle}
                      onChange={(event) => setSignerTitle(event.target.value)}
                      placeholder="Founder, Director, Consultant"
                      style={{ padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px" }}
                    />
                  </label>
                </div>

                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    width: "100%",
                    background: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    padding: "10px 12px",
                    fontSize: "14px",
                    color: "#334155",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(event) => setAgreedToTerms(event.target.checked)}
                    style={{ marginTop: "2px" }}
                  />
                  <span>{ACCEPTANCE_CONSENT_TEXT}</span>
                </label>

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
