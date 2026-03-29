"use client";

import { useEffect, useState } from "react";
import { createClient, getUserOrNull } from "@/lib/supabase/client";
import Link from "next/link";

export default function Header() {
  const [user, setUser] = useState<{ email?: string } | null>(null);

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

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-gray-900">
          Client Contracts
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-500">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-black"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-black"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-black text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-800"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}