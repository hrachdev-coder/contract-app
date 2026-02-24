"use client";

export default function LogoutButton() {
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <button
      type="button"
      className="text-sm text-red-500 hover:underline cursor-pointer
"
      onClick={handleLogout}
    >
      Sign out
    </button>
  );
}
