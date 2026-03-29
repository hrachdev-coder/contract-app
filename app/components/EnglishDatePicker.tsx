"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type EnglishDatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function EnglishDatePicker(props: EnglishDatePickerProps) {
  const selectedDate = useMemo(() => parseIsoDate(props.value), [props.value]);
  const [open, setOpen] = useState(false);
  const [displayMonth, setDisplayMonth] = useState<Date>(selectedDate ?? new Date());
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(displayMonth);

  const firstDayOfMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1);
  const daysInMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 0).getDate();
  const leadingBlanks = firstDayOfMonth.getDay();

  const cells: Array<number | null> = [];
  for (let i = 0; i < leadingBlanks; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => {
          if (!open) {
            setDisplayMonth(selectedDate ?? new Date());
          }
          setOpen((prev) => !prev);
        }}
        disabled={props.disabled}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "10px 12px",
          border: "1px solid #cbd5e1",
          borderRadius: "8px",
          background: props.disabled ? "#f8fafc" : "#ffffff",
          color: selectedDate ? "#0f172a" : "#64748b",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "14px",
          cursor: props.disabled ? "not-allowed" : "pointer",
        }}
      >
        <span>
          {selectedDate
            ? new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              }).format(selectedDate)
            : props.placeholder || "Select date"}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.7" />
          <path d="M8 2v4M16 2v4M3 9h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </button>

      {open && !props.disabled ? (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            zIndex: 40,
            width: "280px",
            background: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "10px",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
            padding: "10px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <button
              type="button"
              onClick={() =>
                setDisplayMonth(
                  new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1)
                )
              }
              style={{ border: "none", background: "transparent", fontSize: "18px", cursor: "pointer" }}
              aria-label="Previous month"
            >
              {"<"}
            </button>
            <div style={{ fontSize: "14px", fontWeight: 600 }}>{monthLabel}</div>
            <button
              type="button"
              onClick={() =>
                setDisplayMonth(
                  new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1)
                )
              }
              style={{ border: "none", background: "transparent", fontSize: "18px", cursor: "pointer" }}
              aria-label="Next month"
            >
              {">"}
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              gap: "6px",
              fontSize: "12px",
              color: "#475569",
              marginBottom: "6px",
            }}
          >
            {WEEKDAY_LABELS.map((label) => (
              <div key={label} style={{ textAlign: "center", fontWeight: 600 }}>
                {label}
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "6px" }}>
            {cells.map((day, index) => {
              if (day === null) {
                return <div key={`blank-${index}`} />;
              }

              const date = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
              const selected = selectedDate ? isSameDay(selectedDate, date) : false;

              return (
                <button
                  key={toIsoDate(date)}
                  type="button"
                  onClick={() => {
                    props.onChange(toIsoDate(date));
                    setOpen(false);
                  }}
                  style={{
                    border: selected ? "1px solid #2563eb" : "1px solid #e2e8f0",
                    background: selected ? "#dbeafe" : "#ffffff",
                    color: "#0f172a",
                    borderRadius: "6px",
                    height: "32px",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              props.onChange("");
              setOpen(false);
            }}
            style={{
              marginTop: "10px",
              width: "100%",
              border: "1px solid #e2e8f0",
              background: "#ffffff",
              color: "#475569",
              borderRadius: "6px",
              height: "34px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            Clear
          </button>
        </div>
      ) : null}
    </div>
  );
}
