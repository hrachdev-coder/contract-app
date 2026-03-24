"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../../auth.css";
import HomeHeader from "../../components/HomeHeader";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [devLinkLoading, setDevLinkLoading] = useState(false);
  const [devSignInLink, setDevSignInLink] = useState<string | null>(null);

  const emailRedirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=/dashboard`
      : undefined;

  const handleResendConfirmation = async () => {
    if (!email) {
      setError("Please enter your email first.");
      return;
    }

    setResending(true);
    setError(null);

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

      setSuccess("Confirmation email sent again. Check inbox, spam, and promotions tabs.");
    } finally {
      setResending(false);
    }
  };

  const handleGenerateDevSignInLink = async () => {
    if (!email) {
      setError("Please enter your email first.");
      return;
    }

    setDevLinkLoading(true);
    setError(null);
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

      setDevSignInLink(data?.actionLink || null);
    } finally {
      setDevLinkLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      setSuccess("Account created. Check your email and click the confirmation link to continue.");
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
            <h1 className="auth-title">Create <em>account</em></h1>
            <p className="auth-subtitle">
              Start managing your influencer contracts today
            </p>
          </div>

          <form onSubmit={handleRegister} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="auth-input"
                placeholder="Jane Doe"
              />
            </div>

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

            {success && (
              <div className="auth-success" style={{ color: "#166534", fontSize: "14px" }}>
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="auth-submit"
            >
              {loading ? "Creating account..." : "Create account"}
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
          </form>

          <div className="auth-footer">
            <p className="auth-footer-text">
              Already have an account?{" "}
              <Link href="/login" className="auth-footer-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}