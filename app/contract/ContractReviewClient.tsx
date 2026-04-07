"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./ContractReviewClient.module.css";

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
  contractId?: string | null;
  initialStatus: string;
  initialFeedback: string | null;
  clientEmail: string;
  senderEmail: string | null;
  createdAt: string;
  contractData: ContractData;
  viewerRole?: "client" | "sender";
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

function reviewStatusSummary(status: string) {
  if (status === "changes_requested") {
    return "The sender can revise the agreement and send an updated version for review.";
  }

  if (status === "accepted" || status === "completed") {
    return "This contract has already been approved and the acceptance trail is now part of the record.";
  }

  if (status === "viewed") {
    return "The contract has been opened. Review the terms carefully before requesting edits or approving it.";
  }

  if (status === "updated") {
    return "An updated version of the contract was sent. Review the revised terms before taking action.";
  }

  return "Review the contract, request changes if something is off, or approve it when the terms are correct.";
}

function senderStatusSummary(status: string) {
  if (status === "changes_requested") {
    return "The client asked for changes. Update the terms below and resend the contract from this screen.";
  }

  if (status === "accepted" || status === "completed") {
    return "This contract has already been approved. Use this view to verify the final terms and the stored record.";
  }

  return "This dashboard screen is an internal preview of the client-facing agreement. Client approval actions stay on the public review link sent by email.";
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
  const viewerRole = props.viewerRole || "client";

  const isFinalized = useMemo(() => status === "accepted" || status === "completed", [status]);
  const canSendUpdatedContract = useMemo(() => status === "changes_requested", [status]);
  const isSenderView = viewerRole === "sender";
  const fieldsDisabled = isSenderView ? !canSendUpdatedContract : isFinalized;
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
  const contractValue = `${form.currency || "$"}${form.paymentAmount || "0"}`;
  const headerKicker = isSenderView ? "Dashboard preview" : "Client review";
  const heroBandTitle = isSenderView
    ? "Inspect the exact agreement your client is reviewing."
    : "Review the terms before you approve the work.";
  const heroBandCopy = isSenderView
    ? "This view exists so you can verify the client-facing agreement, revision notes, and stored record without using the public approval flow yourself."
    : "This page keeps the contract text, requested edits, signer identity, and acceptance record in one place so the approval trail stays clean.";
  const summaryCards = [
    {
      label: "Sender",
      value: representativeName,
      detail: isSenderView
        ? "The account owner or representative who sent this agreement."
        : "The representative who issued this agreement.",
    },
    {
      label: "Client",
      value: props.clientEmail,
      detail: isSenderView
        ? "The recipient who receives the public review link and approval request."
        : "This link is intended for this reviewer and signer.",
    },
    {
      label: "Created",
      value: formatContractDate(props.createdAt),
      detail: "Stored with the contract record and status history.",
    },
  ];

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
      const basePath = isSenderView && props.contractId
        ? `/api/contracts/${props.contractId}`
        : `/api/contract/${props.publicToken}`;
      const res = await fetch(`${basePath}/respond`, {
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
      const basePath = isSenderView && props.contractId
        ? `/api/contracts/${props.contractId}`
        : `/api/contract/${props.publicToken}`;
      const res = await fetch(`${basePath}/resend`, {
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
    <main className={styles.shell}>
      <section className={styles.panel}>
        <div className={styles.headerRow}>
          <div>
            <div className={styles.kicker}>{headerKicker}</div>
            <h1 className={styles.title}>{form.brandName || "Contract"}</h1>
            <p className={styles.subtitle}>{isSenderView ? senderStatusSummary(status) : reviewStatusSummary(status)}</p>
          </div>
          <div className={styles.statusBadge}>{labelForStatus(status)}</div>
        </div>

        <div className={styles.summaryGrid}>
          {summaryCards.map((item) => (
            <div key={item.label} className={styles.summaryCard}>
              <span className={styles.summaryLabel}>{item.label}</span>
              <div className={styles.summaryValue}>{item.value}</div>
              <p className={styles.summaryDetail}>{item.detail}</p>
            </div>
          ))}
        </div>

        <div className={styles.heroBand}>
          <div>
            <div className={styles.heroBandLabel}>Agreement snapshot</div>
            <h2 className={styles.heroBandTitle}>{heroBandTitle}</h2>
            <p className={styles.heroBandCopy}>{heroBandCopy}</p>
          </div>
          <div className={styles.heroBandMetrics}>
            <div className={styles.heroMetricCard}>
              <span className={styles.heroMetricLabel}>Contract value</span>
              <strong className={styles.heroMetricValue}>{contractValue}</strong>
            </div>
            <div className={styles.heroMetricCard}>
              <span className={styles.heroMetricLabel}>Review state</span>
              <strong className={styles.heroMetricValue}>{labelForStatus(status)}</strong>
            </div>
          </div>
        </div>

        <article className={styles.previewCard}>
          <div className={styles.previewHead}>
            <div>
              <h2 className={styles.sectionTitle}>Client Service Agreement</h2>
              <p className={styles.sectionCopy}>This draft is generated from the selected business terms. As fields change, the agreement updates so both parties are reviewing the same record.</p>
            </div>
          </div>

          <div className={styles.sectionStack}>
            {contractSections.map((section) => (
              <section key={section.title} className={styles.copySection}>
                <h3 className={styles.copySectionTitle}>{section.title}</h3>
                <p className={styles.copySectionBody}>{section.body}</p>
              </section>
            ))}
          </div>

          <div className={styles.signatureRow}>
            <div className={styles.signatureCard}>
              <div className={styles.signatureName}>{representativeName}</div>
              <div className={styles.signatureRole}>Company representative</div>
            </div>
            <div className={styles.signatureCard}>
              <div className={styles.signatureName}>{props.clientEmail}</div>
              <div className={styles.signatureRole}>Client reviewer</div>
            </div>
          </div>
        </article>

        <section className={styles.editorCard}>
          <div className={styles.editorHead}>
            <div>
              <h2 className={styles.sectionTitle}>Review and edit the contract terms</h2>
              <p className={styles.sectionCopy}>{isSenderView ? "Use this section to inspect the exact client-facing agreement. Editing is only enabled when the client has asked for changes and you need to resend a revised version." : "Use this section to confirm the business details, request changes if something is wrong, or approve the contract with your legal name."}</p>
            </div>
          </div>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Company name</span>
              <input className={styles.input} value={form.brandName} onChange={handleFormChange("brandName")} disabled={fieldsDisabled} />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Platform</span>
              <input className={styles.input} value={form.platform} onChange={handleFormChange("platform")} disabled={fieldsDisabled} />
            </label>

            <label className={`${styles.field} ${styles.fieldWide}`}>
              <span className={styles.fieldLabel}>Deliverables</span>
              <textarea className={styles.textarea} value={form.deliverables} onChange={handleFormChange("deliverables")} disabled={fieldsDisabled} />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Campaign start</span>
              <EnglishDatePicker
                value={form.campaignStartDate}
                onChange={handleDateChange("campaignStartDate")}
                disabled={fieldsDisabled}
                placeholder="Select start date"
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Campaign end</span>
              <EnglishDatePicker
                value={form.campaignEndDate}
                onChange={handleDateChange("campaignEndDate")}
                disabled={fieldsDisabled}
                placeholder="Select end date"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Payment amount</span>
              <input className={styles.input} type="number" value={form.paymentAmount} onChange={handleFormChange("paymentAmount")} disabled={fieldsDisabled} />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Currency</span>
              <input className={styles.input} value={form.currency} onChange={handleFormChange("currency")} disabled={fieldsDisabled} />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Payment deadline</span>
              <input className={styles.input} type="number" value={form.paymentDeadlineDays} onChange={handleFormChange("paymentDeadlineDays")} disabled={fieldsDisabled} />
            </label>

            <label className={`${styles.field} ${styles.fieldWide}`}>
              <span className={styles.fieldLabel}>Requested changes or notes</span>
              <textarea
                className={styles.textareaLarge}
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                disabled={fieldsDisabled}
                placeholder="Describe anything you want changed before approval"
              />
            </label>
          </div>

          {error ? <p className={styles.messageError}>{error}</p> : null}
          {success ? <p className={styles.messageSuccess}>{success}</p> : null}

          {!isFinalized ? (
            <div className={styles.actionPanel}>
              {isSenderView ? (
                canSendUpdatedContract ? (
                  <>
                    <div className={styles.noticeCard}>
                      <span className={styles.noticeLabel}>Sender action</span>
                      <p className={styles.noticeCopy}>The client asked for changes. Update the terms above, then resend the revised contract using the same client review link.</p>
                    </div>
                    <button
                      type="button"
                      onClick={sendUpdatedContract}
                      disabled={Boolean(loadingAction)}
                      className={styles.primaryAction}
                    >
                      {loadingAction === "send_updated" ? "Sending update..." : "Send updated contract"}
                    </button>
                  </>
                ) : (
                  <div className={styles.noticeCard}>
                    <span className={styles.noticeLabel}>Internal preview</span>
                    <p className={styles.noticeCopy}>This part solves one specific need: it lets you see the exact client-facing agreement from inside the dashboard. The legal name, consent, and approval actions are for the client link only, so they are hidden here.</p>
                  </div>
                )
              ) : canSendUpdatedContract ? (
                <>
                  <div className={styles.noticeCard}>
                    <span className={styles.noticeLabel}>Sender action</span>
                    <p className={styles.noticeCopy}>The client asked for changes. Review the updated terms above, then send the revised contract back through the same workflow.</p>
                  </div>
                  <button
                    type="button"
                    onClick={sendUpdatedContract}
                    disabled={Boolean(loadingAction)}
                    className={styles.primaryAction}
                  >
                    {loadingAction === "send_updated" ? "Sending update..." : "Send updated contract"}
                  </button>
                </>
              ) : (
                <>
                  <div className={styles.signerGrid}>
                    <label className={styles.field}>
                      <span className={styles.fieldLabel}>Full legal name</span>
                      <input
                        type="text"
                        className={styles.input}
                        value={signerName}
                        onChange={(event) => setSignerName(event.target.value)}
                        placeholder="Jane Doe"
                      />
                    </label>
                    <label className={styles.field}>
                      <span className={styles.fieldLabel}>Title or role</span>
                      <input
                        type="text"
                        className={styles.input}
                        value={signerTitle}
                        onChange={(event) => setSignerTitle(event.target.value)}
                        placeholder="Founder, Director, Consultant"
                      />
                    </label>
                  </div>

                  <label className={styles.consentCard}>
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(event) => setAgreedToTerms(event.target.checked)}
                      className={styles.checkbox}
                    />
                    <span>{ACCEPTANCE_CONSENT_TEXT}</span>
                  </label>

                  <div className={styles.actionRow}>
                    <button
                      type="button"
                      onClick={() => submitAction("request_changes")}
                      disabled={Boolean(loadingAction)}
                      className={styles.secondaryAction}
                    >
                      {loadingAction === "request_changes" ? "Submitting..." : "Request edits"}
                    </button>

                    <button
                      type="button"
                      onClick={() => submitAction("accept")}
                      disabled={Boolean(loadingAction)}
                      className={styles.primaryAction}
                    >
                      {loadingAction === "accept" ? "Finalizing..." : "Accept contract"}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className={styles.noticeCard}>
              <span className={styles.noticeLabel}>Approval record</span>
              <p className={styles.noticeCopy}>This agreement has already been finalized. The status, consent text, and signer details are preserved as part of the contract trail.</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
