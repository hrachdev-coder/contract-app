"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DeleteContractButtonProps = {
  contractId: string;
  onDeleted?: (contractId: string) => void;
};

export default function DeleteContractButton({
  contractId,
  onDeleted,
}: DeleteContractButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this contract?")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/contracts/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contractId }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        setError(result.message || "Delete failed");
      } else {
        onDeleted?.(contractId);
        router.refresh();
      }
    } catch {
      setError("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="btn-delete"
        style={{
          fontFamily: "Jost, sans-serif",
          fontSize: "12px",
          fontWeight: "500",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "#dc2626",
          background: "#fef2f2",
          border: "1.5px solid #fecaca",
          borderRadius: "100px",
          padding: "8px 20px",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          opacity: loading ? 0.6 : 1
        }}
      >
        {loading ? (
          "Deleting..."
        ) : (
          <>
            <svg
              style={{ width: "14px", height: "14px" }}
              viewBox="0 0 14 14"
              fill="none"
            >
              <path
                d="M3 3h8M5 3V1.5C5 1.22386 5.22386 1 5.5 1h3C8.77614 1 9 1.22386 9 1.5V3M10.5 3v9.5c0 .2761-.2239.5-.5.5H4c-.27614 0-.5-.2239-.5-.5V3"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Delete
          </>
        )}
      </button>
      {error && (
        <p
          style={{ fontSize: "12px", color: "#dc2626", marginTop: "4px" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
