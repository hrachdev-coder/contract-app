"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function HomeHeader() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

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
        <div className="nav-links">
          <a href="#features"     className="nav-link">Features</a>
          <a href="#how-it-works" className="nav-link">How it works</a>
          <a href="#reviews"      className="nav-link">Reviews</a>
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
    </nav>
  );
}
