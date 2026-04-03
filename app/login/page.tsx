"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../auth.css";
import "../home.css";
import HomeHeader from "../components/HomeHeader";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [devLinkLoading, setDevLinkLoading] = useState(false);
  const [devSignInLink, setDevSignInLink] = useState<string | null>(null);
  const isDevMode = process.env.NODE_ENV !== "production";

  const emailRedirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=/dashboard`
      : undefined;

  const handleResendConfirmation = async () => {
    if (!email) {
      setError("Enter your email first, then resend confirmation.");
      return;
    }

    setResending(true);
    setError(null);
    setInfo(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo,
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      setInfo("Confirmation email sent. Please check inbox, spam, and promotions.");
    } finally {
      setResending(false);
    }
  };

  const handleGenerateDevSignInLink = async () => {
    if (!email) {
      setError("Enter your email first.");
      return;
    }

    setDevLinkLoading(true);
    setError(null);
    setInfo(null);
    setDevSignInLink(null);

    try {
      const res = await fetch("/api/auth/dev-confirmation-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.message || "Could not generate confirmation link.");
        return;
      }

      setInfo("Dev sign-in link generated below.");
      setDevSignInLink(data?.actionLink || null);
    } finally {
      setDevLinkLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div style={{ fontFamily: "sans-serif", background: "var(--background)", minHeight: "100vh" }}>
      <HomeHeader />
      
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Welcome <em>back</em></h1>
            <p className="auth-subtitle">
              Sign in to your account to manage contracts
            </p>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
                placeholder="you@example.com"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-input"
                placeholder="••••••••••"
              />
            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            {info && (
              <div className="auth-success" style={{ color: "#166534", fontSize: "14px" }}>
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="auth-submit"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={resending || loading}
              className="auth-submit"
              style={{
                marginTop: "10px",
                background: "transparent",
                color: "#0f172a",
                border: "1px solid #cbd5e1",
              }}
            >
              {resending ? "Resending confirmation..." : "Resend confirmation email"}
            </button>

            {isDevMode ? (
              <>
                <button
                  type="button"
                  onClick={handleGenerateDevSignInLink}
                  disabled={devLinkLoading || loading}
                  className="auth-submit"
                  style={{
                    marginTop: "10px",
                    background: "transparent",
                    color: "#0f172a",
                    border: "1px solid #cbd5e1",
                  }}
                >
                  {devLinkLoading ? "Generating link..." : "Generate dev sign-in link"}
                </button>

                {devSignInLink && (
                  <p style={{ fontSize: "13px", marginTop: "10px", wordBreak: "break-all" }}>
                    Dev link: <a href={devSignInLink}>{devSignInLink}</a>
                  </p>
                )}
              </>
            ) : null}
          </form>

          <div className="auth-footer">
            <p className="auth-footer-text">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="auth-footer-link">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}