"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResendContractButton({
  publicToken,
}: {
  publicToken: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    setError(null);
    setSent(false);
    try {
      const res = await fetch(`/api/contract/${publicToken}/resend`, {
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
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleResend}
        disabled={loading || sent}
        className="btn-resend disabled:opacity-50"
      >
        {loading ? "Sending..." : sent ? "Sent ✓" : "Resend to client"}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {sent ? <p className="text-xs text-green-600">Client notified by email.</p> : null}
    </div>
  );
}

