"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FinalizeContractButton({
  contractId,
}: {
  contractId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFinalize = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contracts/finalize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contractId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message || "Finalization failed");
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="action-stack">
      <button
        type="button"
        onClick={handleFinalize}
        disabled={loading}
        className="btn-secondary"
      >
        {loading ? "Sending PDF..." : "Send Final PDF"}
      </button>
      {error ? <p className="action-feedback action-feedback-error">{error}</p> : null}
    </div>
  );
}
