"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResendContractButton({
  contractId,
  publicToken,
}: {
  contractId?: string;
  publicToken?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    const endpoint = contractId
      ? `/api/contracts/${contractId}/resend`
      : publicToken
        ? `/api/contract/${publicToken}/resend`
        : null;

    if (!endpoint) {
      setError("Review link is unavailable for this contract.");
      return;
    }

    setLoading(true);
    setError(null);
    setSent(false);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message || "Resend failed");
        return;
      }

      setSent(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="action-stack">
      <button
        type="button"
        onClick={handleResend}
        disabled={loading || sent}
        className="btn-resend"
      >
        {loading ? "Sending..." : sent ? "Sent ✓" : "Resend to client"}
      </button>
      {error ? <p className="action-feedback action-feedback-error">{error}</p> : null}
      {sent ? <p className="action-feedback action-feedback-success">Client notified by email.</p> : null}
    </div>
  );
}

