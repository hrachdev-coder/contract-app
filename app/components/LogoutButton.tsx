"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch('/api/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback: redirect to login
      router.push('/login');
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="btn-ghost"
    >
      Logout
    </button>
  );
}
