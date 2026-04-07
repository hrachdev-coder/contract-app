import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "32px 16px",
        background:
          "radial-gradient(circle at top, rgba(59,130,246,0.14), transparent 28%), linear-gradient(180deg, #eef4ff 0%, #f8fafc 34%, #ffffff 100%)",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "760px",
          background: "rgba(255,255,255,0.94)",
          border: "1px solid rgba(226,232,240,0.96)",
          borderRadius: "32px",
          boxShadow: "0 24px 60px rgba(15,23,42,0.08)",
          padding: "36px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            padding: "8px 14px",
            borderRadius: "999px",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            color: "#2563eb",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          404 · Page not found
        </div>
        <h1
          style={{
            margin: "18px 0 12px",
            fontFamily: "'Sora', serif",
            fontSize: "clamp(36px, 5vw, 56px)",
            lineHeight: 1.08,
            color: "#0f172a",
          }}
        >
          This page is no longer available or the link is incomplete.
        </h1>
        <p
          style={{
            margin: "0 auto",
            maxWidth: "560px",
            fontSize: "16px",
            lineHeight: 1.8,
            color: "#475569",
          }}
        >
          If you opened a contract review link, ask the sender to resend the latest version. If you are working from the dashboard, go back to your contract list and reopen the record from there.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginTop: "28px",
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "50px",
              padding: "0 22px",
              borderRadius: "999px",
              background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              fontSize: "13px",
            }}
          >
            Back to home
          </Link>
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "50px",
              padding: "0 22px",
              borderRadius: "999px",
              background: "#ffffff",
              color: "#0f172a",
              textDecoration: "none",
              border: "1px solid #cbd5e1",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              fontSize: "13px",
            }}
          >
            Open dashboard
          </Link>
          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "50px",
              padding: "0 22px",
              borderRadius: "999px",
              background: "#ffffff",
              color: "#0f172a",
              textDecoration: "none",
              border: "1px solid #cbd5e1",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              fontSize: "13px",
            }}
          >
            Log in
          </Link>
        </div>
      </section>
    </main>
  );
}