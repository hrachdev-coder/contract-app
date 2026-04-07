"use client";

import { useEffect, useRef, useState } from "react";
import { createClient, getUserOrNull } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import ResendContractButton from "../components/ResendContractButton";
import FinalizeContractButton from "../components/FinalizeContractButton";
import BillingPlanGrid from "../components/BillingPlanGrid";
import DeleteContractButton from "../components/DeleteContractButton";
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

function parseAmount(value: string | null | undefined) {
  if (!value) {
    return 0;
  }

  const normalized = value.replace(/[^0-9.]/g, "");
  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) ? amount : 0;
}

function formatAmount(amount: number, currencySymbol: string) {
  const safeAmount = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  return `${currencySymbol}${safeAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function formatContractDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function DashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState<BillingState | null>(null);
  const [contractsError, setContractsError] = useState<string | null>(null);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [checkoutRecentlyCompleted, setCheckoutRecentlyCompleted] = useState(false);
  const hasPurchasedPlan = Boolean(billing?.subscription);
  const checkoutPending = searchParams.get("checkout") === "success";
  const isPlanActivationPending = (checkoutPending || checkoutRecentlyCompleted) && !hasPurchasedPlan;
  const shouldShowPricingPlans =
    Boolean(billing?.configured) &&
    !hasPurchasedPlan &&
    !checkoutRecentlyCompleted &&
    !checkoutPending;
  const normalizedPlanName = (billing?.subscription?.plan_name || "").toLowerCase();
  const isFreeWorkspacePlan = normalizedPlanName === "free";
  const billingBadgeLabel = billing?.configured
    ? isPlanActivationPending
      ? "Plan activation pending"
      : billing.hasActiveAccess
        ? billing.subscription?.plan_name || billing.subscription?.status_formatted || "Active plan"
        : hasPurchasedPlan
          ? isFreeWorkspacePlan
            ? "Free plan active"
            : billing.subscription?.status_formatted || "Plan inactive"
          : "No plan selected"
    : "Billing disabled";
  const billingBadgeBackground = billing?.configured
    ? isPlanActivationPending
      ? "#e0f2fe"
      : billing.hasActiveAccess
        ? "#dcfce7"
        : hasPurchasedPlan
          ? isFreeWorkspacePlan
            ? "#e0e7ff"
            : "#fef3c7"
          : "#fee2e2"
    : "#e2e8f0";
  const billingBadgeColor = billing?.configured
    ? isPlanActivationPending
      ? "#0c4a6e"
      : billing.hasActiveAccess
        ? "#166534"
        : hasPurchasedPlan
          ? isFreeWorkspacePlan
            ? "#3730a3"
            : "#92400e"
          : "#991b1b"
    : "#334155";

  const statusMeta: Record<
    ContractStatus,
    { label: string; className: string; narrative: string }
  > = {
    sent: {
      label: "Sent",
      className: "status-pending",
      narrative: "Waiting for the client to open and review the agreement.",
    },
    viewed: {
      label: "Viewed",
      className: "status-viewed",
      narrative: "The client has opened the agreement and may need a follow-up.",
    },
    changes_requested: {
      label: "Needs Changes",
      className: "status-changes",
      narrative: "The client requested updates before approval.",
    },
    updated: {
      label: "Updated",
      className: "status-updated",
      narrative: "An updated version was sent and is waiting on client confirmation.",
    },
    accepted: {
      label: "Accepted",
      className: "status-accepted",
      narrative: "Approved by the client and ready for final PDF delivery.",
    },
    completed: {
      label: "Completed",
      className: "status-completed",
      narrative: "Finalized and completed in your contract record.",
    },
  };

  const fetchContracts = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .eq("influencer_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        setContracts([]);
        setContractsError(error.message || "Unable to load contracts right now.");
        return;
      }

      setContracts(data || []);
      setContractsError(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchBilling = async () => {
    try {
      const response = await fetch("/api/billing/subscription", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { message?: string };
        setBillingError(payload.message || "Billing status is temporarily unavailable.");
        return;
      }

      const payload = (await response.json()) as BillingState;
      setBilling(payload);
      setBillingError(null);
    } catch {
      setBillingError("Billing status is temporarily unavailable.");
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

  useEffect(() => {
    const raw = window.localStorage.getItem("contrakt_checkout_completed_at");
    if (!raw) {
      return;
    }

    const completedAt = Number(raw);
    if (!Number.isFinite(completedAt)) {
      window.localStorage.removeItem("contrakt_checkout_completed_at");
      return;
    }

    const ageMs = Date.now() - completedAt;
    if (ageMs < 24 * 60 * 60 * 1000) {
      setCheckoutRecentlyCompleted(true);
      return;
    }

    window.localStorage.removeItem("contrakt_checkout_completed_at");
  }, []);

  useEffect(() => {
    if (!billing?.configured || billing?.subscription || billing?.hasActiveAccess) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void (async () => {
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
          // Ignore transient polling errors; next poll will retry.
        }
      })();
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [billing?.configured, billing?.subscription, billing?.hasActiveAccess]);

  useEffect(() => {
    if (!checkoutPending) {
      return;
    }

    window.localStorage.setItem("contrakt_checkout_completed_at", String(Date.now()));
    setCheckoutRecentlyCompleted(true);

    const timeoutId = window.setTimeout(() => {
      router.replace("/dashboard");
    }, 25000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [checkoutPending, router]);

  useEffect(() => {
    if (!hasPurchasedPlan) {
      return;
    }

    window.localStorage.removeItem("contrakt_checkout_completed_at");
    setCheckoutRecentlyCompleted(false);
  }, [hasPurchasedPlan]);

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

  const firstName = user?.email?.split("@")[0] || "there";
  const awaitingReviewCount = contracts.filter((contract) => {
    const status = normalizeStatus(contract.status);
    return status === "sent" || status === "viewed" || status === "updated";
  }).length;
  const needsChangesCount = contracts.filter(
    (contract) => normalizeStatus(contract.status) === "changes_requested"
  ).length;
  const signedCount = contracts.filter((contract) => {
    const status = normalizeStatus(contract.status);
    return status === "accepted" || status === "completed";
  }).length;
  const totalValue = contracts.reduce((sum, contract) => {
    const amount = parseAmount(contract.contract_data?.paymentAmount);
    return sum + amount;
  }, 0);
  const defaultCurrency = contracts[0]?.contract_data?.currency || "$";
  const needsAttentionContract =
    contracts.find((contract) => {
      const status = normalizeStatus(contract.status);
      return status === "changes_requested" || status === "viewed" || status === "accepted";
    }) || contracts[0];
  const focusStatus = needsAttentionContract ? normalizeStatus(needsAttentionContract.status) : null;
  const focusMeta = focusStatus ? statusMeta[focusStatus] : null;
  const focusAmount = needsAttentionContract
    ? formatAmount(
        parseAmount(needsAttentionContract.contract_data?.paymentAmount),
        needsAttentionContract.contract_data?.currency || defaultCurrency
      )
    : null;
  const metricCards = [
    {
      icon: (
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <rect x="3" y="3" width="20" height="20" rx="5" stroke="#3b82f6" strokeWidth="1.6"/>
          <path d="M8 9h10M8 13h7M8 17h5" stroke="#3b82f6" strokeWidth="1.6" strokeLinecap="round"/>
          <circle cx="20" cy="20" r="5" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.4"/>
          <path d="M18.5 20l1 1 2.5-2" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      value: String(contracts.length || 0),
      label: "Tracked contracts",
      detail: "Every contract record in your workspace.",
    },
    {
      icon: (
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <circle cx="13" cy="13" r="9" stroke="#f59e0b" strokeWidth="1.6"/>
          <path d="M13 8v5.5l3.5 3.5" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      value: String(awaitingReviewCount),
      label: "Awaiting action",
      detail: "Sent, viewed, or updated contracts still moving through review.",
    },
    {
      icon: (
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <path d="M4 6h18v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" stroke="#db2777" strokeWidth="1.6"/>
          <path d="M7 10h12M7 14h7" stroke="#db2777" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      ),
      value: String(needsChangesCount),
      label: "Needs revision",
      detail: "Contracts waiting on your edits before the client can approve.",
    },
    {
      icon: (
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <path d="M13 4v18M7 9c0-1.7 1.79-3 4-3h2c2.21 0 4 1.3 4 3s-1.79 3-4 3h-2c-2.21 0-4 1.3-4 3s1.79 3 4 3h2c2.21 0 4-1.3 4-3" stroke="#10b981" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      ),
      value: formatAmount(totalValue, defaultCurrency),
      label: "Pipeline value",
      detail: `${signedCount} signed or completed contracts are already moving to close.`,
    },
  ];

  return (
    <div className="dashboard-shell" style={{ fontFamily: "sans-serif", minHeight: "100vh" }}>
      {/* ── NAV ── */}
      <HomeHeader />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="dashboard-kicker">Contract operations</div>
          <h1 className="dashboard-title">Run approvals with more clarity,<br /><em>{firstName}</em></h1>
          <p className="dashboard-subtitle">This workspace is strongest when it shows what needs attention, what is signed, and which clients are still holding up momentum.</p>
          {billing?.configured ? (
            <div className="billing-inline-row">
              <span
                className="billing-inline-badge"
                style={{ background: billingBadgeBackground, color: billingBadgeColor }}
              >
                {billingBadgeLabel}
              </span>
              {billing.subscription?.renews_at ? (
                <span className="billing-inline-copy">
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
          {billingError ? (
            <p className="dashboard-helper-note">{billingError}</p>
          ) : null}
          {checkoutPending ? (
            <p className="dashboard-helper-note">
              Checkout completed. Finalizing your plan activation...
            </p>
          ) : null}
          <div className="dashboard-overview-grid">
            <section className="dashboard-overview-card">
              <div className="dashboard-overview-head">
                <div>
                  <div className="dashboard-panel-label">Workspace pulse</div>
                  <h2 className="dashboard-panel-title">The clearest next action should always be obvious.</h2>
                </div>
                <Link href="/dashboard/new" className="btn-primary dashboard-panel-cta">
                  + New Contract
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </Link>
              </div>
              <div className="dashboard-signal-grid">
                <div className="dashboard-signal-card">
                  <div className="dashboard-signal-label">Awaiting review</div>
                  <div className="dashboard-signal-value">{awaitingReviewCount}</div>
                  <p className="dashboard-signal-copy">Client-side review is still open on these contracts.</p>
                </div>
                <div className="dashboard-signal-card">
                  <div className="dashboard-signal-label">Needs edits</div>
                  <div className="dashboard-signal-value">{needsChangesCount}</div>
                  <p className="dashboard-signal-copy">These agreements need your revision before they can close.</p>
                </div>
                <div className="dashboard-signal-card">
                  <div className="dashboard-signal-label">Signed pipeline</div>
                  <div className="dashboard-signal-value">{signedCount}</div>
                  <p className="dashboard-signal-copy">Approved or completed contracts already moving through the finish line.</p>
                </div>
              </div>
            </section>

            <aside className="dashboard-side-panel">
              <div className="dashboard-panel-label">Priority contract</div>
              {needsAttentionContract && focusMeta ? (
                <>
                  <h3 className="dashboard-side-title">
                    {needsAttentionContract.contract_data?.brandName || "Untitled Contract"}
                  </h3>
                  <div className="dashboard-side-meta">{focusAmount || formatAmount(0, defaultCurrency)} · {focusMeta.label}</div>
                  <p className="dashboard-side-copy">{focusMeta.narrative}</p>
                  <div className="dashboard-side-stack">
                    <div className="dashboard-side-row">
                      <span>Client</span>
                      <strong>{needsAttentionContract.client_email}</strong>
                    </div>
                    <div className="dashboard-side-row">
                      <span>Created</span>
                      <strong>{formatContractDate(needsAttentionContract.created_at)}</strong>
                    </div>
                  </div>
                  <Link href={`/dashboard/contracts/${needsAttentionContract.id}`} className="btn-secondary dashboard-side-link">
                    Open review page
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="dashboard-side-title">No contracts yet</h3>
                  <p className="dashboard-side-copy">Create the first agreement and this panel will surface the most important item in the pipeline.</p>
                </>
              )}
            </aside>
          </div>
          {shouldShowPricingPlans ? (
            <div className="dashboard-pricing-shell">
              <p className="dashboard-helper-note">
                If you just completed checkout, plan confirmation may take a few seconds.
              </p>
              <BillingPlanGrid
                email={user?.email || null}
                name={user?.email?.split("@")[0] || null}
                userId={user?.id || null}
                redirectPath="/dashboard?checkout=success"
                title={<>Choose a plan to <em>unlock your workspace</em></>}
                subtitle="Pick the plan that matches your current client volume and billing will unlock after the webhook confirms it."
              />
            </div>
          ) : null}

          <div className="stats-grid">
            {metricCards.map((card) => (
              <div key={card.label} className="stat-card">
                <div className="stat-icon">{card.icon}</div>
                <div className="stat-value">{card.value}</div>
                <div className="stat-label">{card.label}</div>
                <p className="stat-detail">{card.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="contracts-section">
          <div className="section-header">
            <div>
              <p className="section-caption">Every card should tell you what stage the contract is in, what it is worth, and what action comes next.</p>
            </div>
            <Link href="/dashboard/new" className="btn-primary">
              + New Contract
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </Link>
          </div>

          {contractsError ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="15" stroke="#dc2626" strokeWidth="2" />
                  <path d="M20 12v10M20 27h.01" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="empty-title">Unable to load contracts</h3>
              <p className="empty-subtitle">{contractsError}</p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  if (user?.id) {
                    setLoading(true);
                    void fetchContracts(user.id);
                  }
                }}
              >
                Retry loading contracts
              </button>
            </div>
          ) : contracts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <rect x="5" y="5" width="30" height="30" rx="8" stroke="#64748b" strokeWidth="2"/>
                  <path d="M10 12h20M10 18h14M10 24h16" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="empty-title">No contracts yet</h3>
              <p className="empty-subtitle">Create your first client contract and start building a cleaner approval trail from the first deal onward.</p>
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
                        <p className="contract-date contract-date-spaced">
                          {template.name} Template
                        </p>
                        <p className="contract-date">
                          {formatContractDate(contract.created_at)}
                        </p>
                      </div>
                      <div className="contract-status">
                        <span className={`status-badge ${meta.className}`}>
                          {meta.label}
                        </span>
                      </div>
                    </div>

                    <div className="contract-guidance">
                      <p className="contract-guidance-copy">{meta.narrative}</p>
                      <Link href={`/dashboard/contracts/${contract.id}`} className="contract-guidance-link">
                        Open review page
                      </Link>
                    </div>

                    {contract.contract_data && (
                      <div className="contract-meta-grid">
                        <div className="contract-meta-card">
                          <span className="contract-meta-label">Platform</span>
                          <p className="contract-meta-value">
                              {contract.contract_data.platform || 'N/A'}
                          </p>
                        </div>
                        <div className="contract-meta-card">
                          <span className="contract-meta-label">Payment</span>
                          <p className="contract-meta-value">
                            {formatAmount(
                              parseAmount(contract.contract_data.paymentAmount),
                              contract.contract_data.currency || "$"
                            )}
                          </p>
                        </div>
                        <div className="contract-meta-card contract-meta-card-wide">
                          <span className="contract-meta-label">Deliverables</span>
                          <p className="contract-meta-value">
                              {contract.contract_data.deliverables || 'N/A'}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="contract-actions">
                      {normalizedStatus === "changes_requested" && contract.public_token ? (
                        <Link
                          href={`/dashboard/contracts/${contract.id}`}
                          className="btn-secondary"
                        >
                          Review requested changes
                        </Link>
                      ) : null}
                      {normalizedStatus === "changes_requested" && contract.public_token ? (
                        <ResendContractButton contractId={contract.id} publicToken={contract.public_token} />
                      ) : null}
                      {normalizedStatus === "accepted" ? (
                        <FinalizeContractButton contractId={contract.id} />
                      ) : null}
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
      <Link href="/dashboard/new" className="dashboard-mobile-fab">
        <span className="dashboard-mobile-fab-plus">+</span>
        New contract
      </Link>
    </div>
  );
}
