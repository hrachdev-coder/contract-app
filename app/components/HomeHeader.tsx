"use client";

import { useEffect, useState } from "react";
import { createClient, getUserOrNull } from "@/lib/supabase/client";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function HomeHeader() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return;
    }

    const supabase = createClient();

    const getUser = async () => {
      const nextUser = await getUserOrNull(supabase);
      setUser(nextUser);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="logo">
          <div className="logo-mark">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 4.5h12M3 9h8M3 13.5h10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="logo-text">Contrakt</span>
        </Link>
        <button className="nav-hamburger" onClick={() => setMobileMenuOpen(v => !v)} aria-label="Open menu">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect y="6" width="28" height="2.5" rx="1.25" fill="#3b82f6" />
            <rect y="13" width="28" height="2.5" rx="1.25" fill="#3b82f6" />
            <rect y="20" width="28" height="2.5" rx="1.25" fill="#3b82f6" />
          </svg>
        </button>
        <div className="nav-links">
          <Link href="/#features" className="nav-link">Features</Link>
          <Link href="/#how-it-works" className="nav-link">How it works</Link>
          <Link href="/#reviews" className="nav-link">Reviews</Link>
          <div className="nav-divider" />
          {user ? (
            <>
              <Link href="/dashboard" className="btn-ghost">Dashboard</Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login"    className="btn-ghost">Log in</Link>
              <Link href="/register" className="btn-filled">Get started</Link>
            </>
          )}
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-nav-content" onClick={e => e.stopPropagation()}>
            <button className="mobile-nav-close" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">×</button>
            <Link href="/#features" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Features</Link>
            <Link href="/#how-it-works" className="nav-link" onClick={() => setMobileMenuOpen(false)}>How it works</Link>
            <Link href="/#reviews" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Reviews</Link>
            <div className="nav-divider" />
            {user ? (
              <>
                <Link href="/dashboard" className="btn-ghost" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/login"    className="btn-ghost" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                <Link href="/register" className="btn-filled" onClick={() => setMobileMenuOpen(false)}>Get started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
