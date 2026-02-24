import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: contracts } = await supabase
    .from("contracts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">
            Influencer Contracts
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            My Contracts
          </h2>
          <Link
            href="/dashboard/new"
            className="bg-black text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-800"
          >
            + New Contract
          </Link>
        </div>

        {/* Contracts list */}
        {!contracts || contracts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">No contracts yet</p>
            <p className="text-sm mt-1">
              Create your first contract to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className="bg-white rounded-2xl border border-gray-200 px-5 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {contract.contract_data?.brandName || "Untitled"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {contract.client_email}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(contract.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      contract.status === "signed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {contract.status === "signed" ? "Signed ✅" : "Pending ⏳"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}