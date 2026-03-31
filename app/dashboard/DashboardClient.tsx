"use client";

import { useEffect, useRef, useState } from "react";
import { createClient, getUserOrNull } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import ResendContractButton from "../components/ResendContractButton";
import FinalizeContractButton from "../components/FinalizeContractButton";
import BillingPlanGrid from "../components/BillingPlanGrid";
import DeleteContractButton from "../components/DeleteContractButton";
import LemonSqueezyCheckoutButton from "../components/LemonSqueezyCheckoutButton";
import LogoutButton from "../components/LogoutButton";
import type { ContractData, ContractStatus } from "@/app/types/contracts";
import { getContractTemplateById } from "@/lib/contract/templates";
import "./dashboard.css";
import "../home.css";
import HomeHeader from "../components/HomeHeader";

type Contract = {
  id: string;
  client_email: string;
  contract_data: ContractData | null;
  status: string;
  created_at: string;
  public_token: string | null;
};

type BillingState = {
  configured: boolean;
  hasActiveAccess: boolean;
  subscription: {
    status: string | null;
    status_formatted: string | null;
    plan_name: string | null;
    renews_at: string | null;
    ends_at: string | null;
    customer_portal_url: string | null;
    update_payment_method_url: string | null;
  } | null;
};

declare global {
  interface Window {
    refreshDashboard?: () => void;
  }
}

function normalizeStatus(status: string): ContractStatus {
  if (status === "pending") return "sent";
  if (status === "signed") return "completed";
  if (status === "accepted") return "accepted";
  if (status === "needs_changes") return "changes_requested";
  if (status === "viewed") return "viewed";
  if (status === "changes_requested") return "changes_requested";
  if (status === "updated") return "updated";
  if (status === "completed") return "completed";
  return "sent";
}

export default function DashboardClient() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState<BillingState | null>(null);

  const statusMeta: Record<
    ContractStatus,
    { label: string; className: string }
  > = {
    sent: { label: "Sent", className: "status-pending" },
    viewed: { label: "Viewed", className: "status-viewed" },
    changes_requested: {
      label: "Needs Changes",
      className: "status-changes",
    },
    updated: { label: "Updated", className: "status-updated" },
    accepted: { label: "Accepted", className: "status-accepted" },
    completed: {
      label: "Completed",
      className: "status-completed",
    },
  };

  const fetchContracts = async (userId: string) => {
    const { data } = await supabase
      .from("contracts")
      .select("*")
      .eq("influencer_id", userId)
      .order("created_at", { ascending: false });
    
    setContracts(data || []);
    setLoading(false);
  };

  const fetchBilling = async () => {
    try {
      const response = await fetch("/api/billing/subscription", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as BillingState;
      setBilling(payload);
    } catch {
      // Non-critical billing panel.
    }
  };

  const handleDeleteSuccess = (contractId: string) => {
    setContracts((currentContracts) =>
      currentContracts.filter((contract) => contract.id !== contractId)
    );
  };

  // Keep a stable ref to the current userId so refreshDashboard never gets stale
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Register the global refresh helper once
    if (typeof window !== 'undefined') {
      window.refreshDashboard = () => {
        if (userIdRef.current) {
          void fetchContracts(userIdRef.current);
        }
      };
    }

    const getUser = async () => {
      const user = await getUserOrNull(supabase);
      if (!user) {
        router.push("/login");
        return;
      }
      userIdRef.current = user.id;
      setUser(user);
      void fetchBilling();
      await fetchContracts(user.id);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED" && !session) {
        router.push("/login");
        return;
      }
      const nextUser = session?.user ?? null;
      userIdRef.current = nextUser?.id ?? null;
      setUser(nextUser);
      if (nextUser?.id) {
        void fetchBilling();
        void fetchContracts(nextUser.id);
      } else {
        setContracts([]);
        setLoading(false);
        router.push("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
      if (typeof window !== "undefined") {
        window.refreshDashboard = undefined;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div style={{ fontFamily: "sans-serif", background: "var(--background)", minHeight: "100vh" }}>
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1 className="dashboard-title">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "sans-serif", background: "var(--background)", minHeight: "100vh" }}>
      {/* ── NAV ── */}
      <HomeHeader />
      {/* ...existing code... */}
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Welcome back,<br /><em>{user?.email?.split('@')[0]}</em></h1>
          <p className="dashboard-subtitle">Manage client contracts and track every review from one dashboard.</p>
          {billing?.configured ? (
            <div
              style={{
                marginTop: "20px",
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  padding: "8px 14px",
                  borderRadius: "999px",
                  background: billing.hasActiveAccess ? "#dcfce7" : "#fef3c7",
                  color: billing.hasActiveAccess ? "#166534" : "#92400e",
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {billing.hasActiveAccess
                  ? billing.subscription?.plan_name || billing.subscription?.status_formatted || "Active plan"
                  : "Billing inactive"}
              </span>
              {billing.subscription?.renews_at ? (
                <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
                  Renews {new Date(billing.subscription.renews_at).toLocaleDateString("en-US")}
                </span>
              ) : null}
              {billing.subscription?.customer_portal_url ? (
                <a
                  href={billing.subscription.customer_portal_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost"
                >
                  Manage Billing
                </a>
              ) : null}
            </div>
          ) : null}
          {billing?.configured ? (
            <div style={{ marginTop: "28px" }}>
              <BillingPlanGrid
                email={user?.email || null}
                name={user?.email?.split("@")[0] || null}
                userId={user?.id || null}
                redirectPath="/dashboard"
                title={billing?.hasActiveAccess ? "Change or upgrade your <em>workspace plan</em>" : "Choose a plan to <em>unlock your workspace</em>"}
                subtitle={billing?.hasActiveAccess ? "Switch plans any time through a new hosted checkout. Your current subscription details stay visible below." : "Pick the plan that matches your current client volume and billing will unlock after the webhook confirms it."}
              />
            </div>
          ) : (
            <div style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
              <LemonSqueezyCheckoutButton
                label="Upgrade Your Workspace"
                className="btn-primary"
                email={user?.email || null}
                name={user?.email?.split("@")[0] || null}
                userId={user?.id || null}
                planId="pro"
                redirectPath="/dashboard"
              />
            </div>
          )}
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                  <rect x="3" y="3" width="20" height="20" rx="5" stroke="#3b82f6" strokeWidth="1.6"/>
                  <path d="M8 9h10M8 13h7M8 17h5" stroke="#3b82f6" strokeWidth="1.6" strokeLinecap="round"/>
                  <circle cx="20" cy="20" r="5" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.4"/>
                  <path d="M18.5 20l1 1 2.5-2" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="stat-value">{contracts.length || 0}</div>
              <div className="stat-label">Total Contracts</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                  <circle cx="13" cy="13" r="9" stroke="#10b981" strokeWidth="1.6"/>
                  <path d="M13 8v5.5l3.5 3.5" stroke="#10b981" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="stat-value">
                {contracts.filter((c) => {
                  const status = normalizeStatus(c.status);
                  return status === "completed";
                }).length}
              </div>
              <div className="stat-label">Completed Contracts</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                  <path d="M4 6h18v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" stroke="#64748b" strokeWidth="1.6"/>
                  <path d="M9 6V4M17 6V4M4 11h18" stroke="#64748b" strokeWidth="1.6" strokeLinecap="round"/>
                  <path d="M9 16l2 2 4-4" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="stat-value">
                ${contracts.reduce((sum, c) => {
                  const amount = parseFloat(c.contract_data?.paymentAmount || '0');
                  return sum + amount;
                }, 0).toLocaleString()}
              </div>
              <div className="stat-label">Total Value</div>
            </div>
          </div>
        </div>

        <div className="contracts-section">
          <div className="section-header">
            <h2 className="section-title">Client Contracts</h2>
            <Link href="/dashboard/new" className="btn-primary">
              + New Contract
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </Link>
          </div>

          {contracts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect x="5" y="5" width="30" height="30" rx="8" stroke="#64748b" strokeWidth="2"/>
                  <path d="M10 12h20M10 18h14M10 24h16" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="empty-title">No contracts yet</h3>
              <p className="empty-subtitle">Create your first client contract and send it out for review</p>
              <Link href="/dashboard/new" className="btn-primary">
                Create Your First Contract
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </Link>
            </div>
          ) : (
            <div className="contracts-grid">
              {contracts.map((contract) => {
                const normalizedStatus = normalizeStatus(contract.status);
                const meta = statusMeta[normalizedStatus] ?? statusMeta.sent;
                const template = getContractTemplateById(
                  contract.contract_data?.contractTemplate || "blank"
                );

                return (
                  <div key={contract.id} className="contract-card" data-contract-id={contract.id}>
                    <div className="contract-header">
                      <div className="contract-info">
                        <h3 className="contract-brand">
                          {contract.contract_data?.brandName || "Untitled Contract"}
                        </h3>
                        <p className="contract-email">{contract.client_email}</p>
                        <p className="contract-date" style={{ marginTop: "6px" }}>
                          {template.name} Template
                        </p>
                        <p className="contract-date">
                          {new Date(contract.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="contract-status">
                        <span className={`status-badge ${meta.className}`}>
                          {meta.label}
                        </span>
                      </div>
                    </div>
                    
                    {contract.contract_data && (
                      <div style={{ marginTop: '16px' }}>
                        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                          <div>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Platform</span>
                            <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginTop: '4px' }}>
                              {contract.contract_data.platform || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Payment</span>
                            <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginTop: '4px' }}>
                              {contract.contract_data.currency || '$'}{contract.contract_data.paymentAmount || '0'}
                            </p>
                          </div>
                          <div>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Deliverables</span>
                            <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', marginTop: '4px' }}>
                              {contract.contract_data.deliverables || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {normalizedStatus === "changes_requested" && (
                      <div className="contract-actions">
                        {contract.public_token ? (
                          <>
                            <Link
                              href={`/contract/${contract.public_token}`}
                              className="btn-secondary"
                            >
                              Review Requested Changes
                            </Link>
                            <ResendContractButton publicToken={contract.public_token} />
                          </>
                        ) : (
                          <p style={{ color: "#b91c1c", fontSize: "12px" }}>
                            Review link is missing for this contract. Please create a new contract.
                          </p>
                        )}
                      </div>
                    )}

                    {normalizedStatus === "accepted" && (
                      <div className="contract-actions">
                        <FinalizeContractButton contractId={contract.id} />
                      </div>
                    )}

                    <div className="contract-actions">
                      <DeleteContractButton
                        contractId={contract.id}
                        onDeleted={handleDeleteSuccess}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
