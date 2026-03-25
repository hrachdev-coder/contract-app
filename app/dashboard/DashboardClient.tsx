"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ResendContractButton from "../components/ResendContractButton";
import DeleteContractButton from "../components/DeleteContractButton";
import LogoutButton from "../components/LogoutButton";
import type { ContractStatus } from "@/app/types/contracts";
import "./dashboard.css";
import "../home.css";

type Contract = {
  id: string;
  client_email: string;
  contract_data: any;
  status: string;
  created_at: string;
  public_token: string | null;
};

function normalizeStatus(status: string): ContractStatus {
  if (status === "pending") return "sent";
  if (status === "signed") return "completed";
  if (status === "accepted") return "completed";
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
  const [user, setUser] = useState<any>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

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
      (window as any).refreshDashboard = () => {
        if (userIdRef.current) {
          void fetchContracts(userIdRef.current);
        }
      };
    }

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      userIdRef.current = user.id;
      setUser(user);
      await fetchContracts(user.id);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      userIdRef.current = nextUser?.id ?? null;
      setUser(nextUser);
      if (nextUser?.id) {
        void fetchContracts(nextUser.id);
      } else {
        setContracts([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
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
            <a href="/#features" className="nav-link">Features</a>
            <a href="/#how-it-works" className="nav-link">How it works</a>
            <a href="/#reviews" className="nav-link">Reviews</a>
            <div className="nav-divider" />
            <Link href="/dashboard" className="btn-ghost">Dashboard</Link>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Welcome back,<br /><em>{user?.email?.split('@')[0]}</em></h1>
          <p className="dashboard-subtitle">Manage creator contracts and track every review from one dashboard.</p>
          
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
            <h2 className="section-title">Creator Contracts</h2>
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
              <p className="empty-subtitle">Create your first creator contract and send it out for review</p>
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

                return (
                  <div key={contract.id} className="contract-card" data-contract-id={contract.id}>
                    <div className="contract-header">
                      <div className="contract-info">
                        <h3 className="contract-brand">
                          {contract.contract_data?.brandName || "Untitled Contract"}
                        </h3>
                        <p className="contract-email">{contract.client_email}</p>
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
