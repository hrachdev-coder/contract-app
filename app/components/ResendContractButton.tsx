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

  const handleResend = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/contract/${publicToken}/resend`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message || "Resend failed");
        return;
      }

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
        disabled={loading}
        className="btn-resend disabled:opacity-50"
      >
        {loading ? "Resending..." : "Resend"}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

