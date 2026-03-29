"use client";

import { useState } from "react";

type LemonSqueezyCheckoutButtonProps = {
  label: string;
  className: string;
  email?: string | null;
  name?: string | null;
  userId?: string | null;
  redirectPath?: string;
};

export default function LemonSqueezyCheckoutButton(props: LemonSqueezyCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: props.email,
          name: props.name,
          userId: props.userId,
          redirectPath: props.redirectPath,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        url?: string;
        message?: string;
      };

      if (!response.ok || !payload.url) {
        throw new Error(payload.message || "Unable to start checkout.");
      }

      window.location.href = payload.url;
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to start checkout.");
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={props.className}
        aria-busy={loading}
      >
        {loading ? "Redirecting..." : props.label}
      </button>
      {error ? (
        <p style={{ margin: 0, fontSize: "12px", color: "#b91c1c" }}>{error}</p>
      ) : null}
    </div>
  );
}