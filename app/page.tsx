import Link from "next/link";
import "./home.css";
import HomeHeader from "./components/HomeHeader";
import BillingPlanGrid from "./components/BillingPlanGrid";
import LemonSqueezyCheckoutButton from "./components/LemonSqueezyCheckoutButton";
import HomeScrollAnimations from "./components/HomeScrollAnimations";
import { createClient } from "@/lib/supabase/server";
import type { ContractData } from "@/app/types/contracts";

export const dynamic = "force-dynamic";

type HomeContractRow = {
  id: string;
  status: string;
  created_at: string;
  contract_data: Partial<ContractData> | null;
};

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

function getStatusUi(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "completed" || normalized === "accepted") {
    return { label: "signed", className: "badge-signed", dot: "#4caf50" };
  }

  if (normalized === "changes_requested") {
    return { label: "review", className: "badge-review", dot: "#e91e63" };
  }

  return { label: "pending", className: "badge-pending", dot: "#ff9800" };
}

const operatingSignals = [
  {
    label: "No client login required",
    description: "Clients review, request edits, and sign from a secure link.",
  },
  {
    label: "Revision-aware workflow",
    description: "Keep negotiation inside one contract thread instead of email chains.",
  },
  {
    label: "Audit-ready acceptance",
    description: "Store consent text, timestamps, and signer details for each approval.",
  },
];

const trustHighlights = [
  {
    title: "Approval trail",
    body: "Every signed contract captures status history, timestamps, and confirmation language.",
  },
  {
    title: "Client-ready links",
    body: "Share one clean review page instead of PDFs, edits, and approval emails spread everywhere.",
  },
  {
    title: "Service-business templates",
    body: "Start from structured scopes, retainers, and deliverable-based agreements.",
  },
];

const featureCards = [
  {
    icon: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="3" y="3" width="20" height="20" rx="5" stroke="#d4826e" strokeWidth="1.6"/><path d="M8 9h10M8 13h7M8 17h5" stroke="#d4826e" strokeWidth="1.6" strokeLinecap="round"/><circle cx="20" cy="20" r="5" fill="#fce8e4" stroke="#d4826e" strokeWidth="1.4"/><path d="M18.5 20l1 1 2.5-2" stroke="#d4826e" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: "Guided contract builder",
    desc: "Turn client scope, payment terms, usage rights, and deadlines into a polished agreement without drafting from scratch.",
  },
  {
    icon: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M4 6h18v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" stroke="#d4826e" strokeWidth="1.6"/><path d="M9 6V4M17 6V4M4 11h18" stroke="#d4826e" strokeWidth="1.6" strokeLinecap="round"/><path d="M9 16l2 2 4-4" stroke="#d4826e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: "Client approval flow",
    desc: "Send a review link by email so clients can approve, request edits, and sign without creating an account.",
  },
  {
    icon: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><circle cx="13" cy="13" r="9" stroke="#d4826e" strokeWidth="1.6"/><path d="M13 8v5.5l3.5 3.5" stroke="#d4826e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: "Live status tracking",
    desc: "See what needs action now: sent, viewed, changes requested, updated, accepted, or completed.",
  },
  {
    icon: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="3" y="7" width="20" height="15" rx="3" stroke="#d4826e" strokeWidth="1.6"/><path d="M17 7V6a4 4 0 00-8 0v1" stroke="#d4826e" strokeWidth="1.6" strokeLinecap="round"/><circle cx="13" cy="14" r="2.5" stroke="#d4826e" strokeWidth="1.5"/><path d="M13 16.5v2" stroke="#d4826e" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    title: "Audit-ready records",
    desc: "Keep acceptance history, signer details, and consent copy attached to the agreement for stronger documentation.",
  },
  {
    icon: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="3" y="3" width="9" height="9" rx="2" stroke="#d4826e" strokeWidth="1.6"/><rect x="14" y="3" width="9" height="9" rx="2" stroke="#d4826e" strokeWidth="1.6"/><rect x="3" y="14" width="9" height="9" rx="2" stroke="#d4826e" strokeWidth="1.6"/><circle cx="18.5" cy="18.5" r="4.5" fill="#fce8e4" stroke="#d4826e" strokeWidth="1.4"/><path d="M17 18.5h3M18.5 17v3" stroke="#d4826e" strokeWidth="1.3" strokeLinecap="round"/></svg>,
    title: "Operations dashboard",
    desc: "Track contract value, current pipeline, and follow-ups in one workspace instead of chasing spreadsheets and inboxes.",
  },
  {
    icon: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M13 3l2.8 6 6.2.9-4.5 4.4 1 6.2-5.5-2.8-5.5 2.8 1-6.2-4.5-4.4 6.2-.9L13 3z" stroke="#d4826e" strokeWidth="1.6" strokeLinejoin="round" fill="#fce8e4"/></svg>,
    title: "Reusable templates",
    desc: "Reuse proven contract structures across retainers, project scopes, licensing work, and ongoing client services.",
  },
];

const workflowSteps = [
  {
    n: "01",
    t: "Capture the deal terms",
    d: "Enter client details, deliverables, fees, dates, usage rights, and payment timing in one guided flow.",
  },
  {
    n: "02",
    t: "Generate the contract",
    d: "Contrakt assembles the agreement language and structure so you can send a professional draft quickly.",
  },
  {
    n: "03",
    t: "Send, review, and revise",
    d: "Your client opens one link, reviews the terms, requests edits if needed, and signs when ready.",
  },
  {
    n: "04",
    t: "Track the final outcome",
    d: "See what is waiting on review, what was approved, and what has been completed from the dashboard.",
  },
];

const useCases = [
  {
    q: "Creative studios can keep scope, revision requests, and final approval inside one clean client workflow.",
    name: "Creative Studio",
    handle: "Multi-project workflow",
    bg: "#fde8e4",
    fg: "#a04030",
    i: "CS",
  },
  {
    q: "Consultants can lock in scope, compensation, and deadlines before kickoff instead of relying on email summaries.",
    name: "Independent Consultant",
    handle: "Client onboarding flow",
    bg: "#e8eaf6",
    fg: "#3949ab",
    i: "IC",
  },
  {
    q: "Agencies can standardize agreements across accounts while giving every client a simple, branded approval experience.",
    name: "Client Services Agency",
    handle: "Team-ready contract ops",
    bg: "#e8f5e9",
    fg: "#2e7d32",
    i: "CA",
  },
];

export default async function HomePage() {
  const currentYear = new Date().getFullYear();
  let contracts: HomeContractRow[] = [];

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("contracts")
        .select("id, status, created_at, contract_data")
        .eq("influencer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)
        .returns<HomeContractRow[]>();

      contracts = data || [];
    }
  } catch {
    contracts = [];
  }

  const hasContracts = contracts.length > 0;
  const defaultCurrency = contracts[0]?.contract_data?.currency || "$";
  const totalValue = contracts.reduce(
    (sum, contract) => sum + parseAmount(contract.contract_data?.paymentAmount),
    0
  );
  const completedValue = contracts.reduce((sum, contract) => {
    const normalized = contract.status.toLowerCase();
    const isCompleted = normalized === "accepted" || normalized === "completed";
    return isCompleted ? sum + parseAmount(contract.contract_data?.paymentAmount) : sum;
  }, 0);
  const completedPercent = totalValue > 0 ? Math.round((completedValue / totalValue) * 100) : 0;
  const signedContract = contracts.find((contract) => {
    const normalized = contract.status.toLowerCase();
    return normalized === "accepted" || normalized === "completed";
  });
  const inProgressContract = contracts.find((contract) => {
    const normalized = contract.status.toLowerCase();
    return normalized === "sent" || normalized === "viewed" || normalized === "updated";
  });
  const previewContracts = contracts.slice(0, 4);
  const pendingContracts = contracts.filter((contract) => {
    const normalized = contract.status.toLowerCase();
    return normalized === "sent" || normalized === "viewed" || normalized === "updated";
  }).length;
  const signedContractsCount = contracts.filter((contract) => {
    const normalized = contract.status.toLowerCase();
    return normalized === "accepted" || normalized === "completed";
  }).length;
  const liveMetrics = hasContracts
    ? [
        { value: `${contracts.length}`, label: "active records" },
        { value: `${pendingContracts}`, label: "awaiting action" },
        { value: `${signedContractsCount}`, label: "signed" },
      ]
    : [
        { value: "1 link", label: "for client review" },
        { value: "0 logins", label: "required from clients" },
        { value: "1 trail", label: "of approval records" },
      ];

  return (
    <div className="home-page" style={{ fontFamily: "sans-serif", background: "var(--background)", minHeight: "100vh" }}>
      <HomeScrollAnimations />

      {/* ── NAV ── */}
      <HomeHeader />

      {/* ── HERO ── */}
      <section className="hero">
        <div>
          <div className="hero-eyebrow">
            <span className="eyebrow-dot" />
            Built for agencies, consultants, and service teams
          </div>
          <h1 className="hero-title">
            Stop losing deals to<br /><em>messy contract handoffs</em>
          </h1>
          <p className="hero-sub">
            Create the agreement, send one client-ready review link, capture signatures, and keep the full approval trail in a dashboard your team can actually use.
          </p>
          <div className="hero-actions">
            <a href="/register" className="btn-hero-primary">
              Create your first contract
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="/login" className="btn-hero-secondary">
              Open dashboard
            </a>
            <LemonSqueezyCheckoutButton
              label="See paid plans"
              className="btn-ghost"
              planId="pro"
              redirectPath="/dashboard"
            />
          </div>
          <div className="hero-proof-grid">
            {operatingSignals.map((signal) => (
              <div key={signal.label} className="hero-proof-card">
                <div className="hero-proof-label">{signal.label}</div>
                <p className="hero-proof-copy">{signal.description}</p>
              </div>
            ))}
          </div>
          <div className="hero-trust">
            <div className="trust-avatars">
              {[
                { bg:"#f7d5ce", color:"#a04030", t:"S" },
                { bg:"#dde8f5", color:"#305080", t:"A" },
                { bg:"#e0f0e0", color:"#306040", t:"J" },
                { bg:"#f5e0f5", color:"#703070", t:"M" },
              ].map((a, i) => (
                <div key={i} className="trust-avatar" style={{ background: a.bg, color: a.color }}>{a.t}</div>
              ))}
            </div>
            <p className="trust-text"><strong>Designed for service work</strong> where scope clarity and faster approval directly affect revenue.</p>
          </div>
        </div>

        <div className="hero-visual">
          <div className="float-card float-1">
            <div className="float-icon" style={{ background:"#e8f5e9" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 9l4 4 8-8" stroke="#2e7d32" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="float-title">{signedContract ? "Latest Signed ✓" : "Contract Status"}</div>
              <div className="float-sub">
                {signedContract
                  ? `${signedContract.contract_data?.brandName || "Contract"} · ${formatAmount(parseAmount(signedContract.contract_data?.paymentAmount), signedContract.contract_data?.currency || defaultCurrency)}`
                  : "Sign in to see your latest signed contract"}
              </div>
            </div>
          </div>

          <div className="float-card float-2">
            <div className="float-icon" style={{ background:"#fff8e1" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" stroke="#f57f17" strokeWidth="1.5"/>
                <path d="M9 5v4l2.5 2.5" stroke="#f57f17" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="float-title">{inProgressContract ? "Awaiting Review" : "In Progress"}</div>
              <div className="float-sub">
                {inProgressContract
                  ? `${inProgressContract.contract_data?.brandName || "Contract"} · ${formatAmount(parseAmount(inProgressContract.contract_data?.paymentAmount), inProgressContract.contract_data?.currency || defaultCurrency)}`
                  : "Your active contracts appear here"}
              </div>
            </div>
          </div>

          <div className="card-main">
            <div className="card-chip">
              <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#d4826e"/></svg>
              {hasContracts ? "Live Contract Pipeline" : "Client Ops Preview"}
            </div>
            <div className="amount-display">{formatAmount(totalValue, defaultCurrency)}</div>
            <div className="amount-label">
              {hasContracts
                ? `Total contract value across ${contracts.length} tracked contracts`
                : "A single place to send, review, sign, and track client agreements"}
            </div>
            <div className="hero-metrics-row">
              {liveMetrics.map((metric) => (
                <div key={metric.label} className="hero-metric-card">
                  <div className="hero-metric-value">{metric.value}</div>
                  <div className="hero-metric-label">{metric.label}</div>
                </div>
              ))}
            </div>
            <div className="progress-bar-wrap">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.min(100, Math.max(0, completedPercent))}%` }}
              />
            </div>
            <div className="progress-meta">
              <span>{completedPercent}% completed</span>
              <span>{formatAmount(completedValue, defaultCurrency)} completed</span>
            </div>
            <div className="hero-checklist">
              <div className="hero-check-item">Review links for clients</div>
              <div className="hero-check-item">Revision requests in one thread</div>
              <div className="hero-check-item">Timestamped acceptance records</div>
            </div>
            <div className="contract-items">
              {hasContracts ? (
                previewContracts.map((contract) => {
                  const brandName = contract.contract_data?.brandName || "Untitled Contract";
                  const statusUi = getStatusUi(contract.status);
                  const amount = formatAmount(
                    parseAmount(contract.contract_data?.paymentAmount),
                    contract.contract_data?.currency || defaultCurrency
                  );
                  const subtitle =
                    contract.contract_data?.deliverables ||
                    contract.contract_data?.platform ||
                    new Date(contract.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });

                  return (
                    <div key={contract.id} className="citem">
                      <div className="citem-left">
                        <div className="citem-dot" style={{ background: statusUi.dot }} />
                        <div>
                          <div className="citem-name">{brandName.slice(0, 1).toUpperCase()} - {brandName}</div>
                          <div className="citem-sub">{subtitle}</div>
                        </div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:13, fontWeight:600, color:"var(--ink)", marginBottom:4 }}>{amount}</div>
                        <span className={`citem-badge ${statusUi.className}`}>{statusUi.label}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="citem">
                  <div className="citem-left">
                    <div className="citem-dot" style={{ background: "#94a3b8" }} />
                    <div>
                      <div className="citem-name">No contracts yet</div>
                      <div className="citem-sub">Create your first contract from the dashboard</div>
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:13, fontWeight:600, color:"var(--ink)", marginBottom:4 }}>$0</div>
                    <span className="citem-badge badge-pending">new</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="stats-row">
        <div className="stats-inner">
          {[
            { n:"1", e:" link", l:"For client review and approval" },
            { n:"2-way", e:"", l:"Revision workflow before signing" },
            { n:"Full", e:" trail", l:"Of consent, timestamps, and status" },
          ].map((s,i) => (
            <div key={i} className="stat-cell">
              <div className="stat-num">{s.n}<em>{s.e}</em></div>
              <div className="stat-lbl">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <section className="trust-strip">
        <div className="trust-strip-head">
          <div className="section-eyebrow">Why it feels reliable</div>
          <h2 className="section-title">Built to reduce admin drag and approval risk</h2>
          <p className="section-sub">This is not just a landing page promise. The workflow is shaped around real contract handoff problems: unclear scope, slow approvals, scattered edits, and missing documentation.</p>
        </div>
        <div className="trust-strip-grid">
          {trustHighlights.map((item) => (
            <div key={item.title} className="trust-strip-card">
              <div className="trust-strip-title">{item.title}</div>
              <p className="trust-strip-copy">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="features-section">
        <div className="features-head">
          <div className="section-eyebrow">Features</div>
          <h2 className="section-title">The contract workflow your team actually needs to <br /><em>close work cleanly</em></h2>
          <p className="section-sub">Contrakt is strongest when you need one operational system for sending scopes, collecting approval, and storing what happened after the client says yes.</p>
        </div>
        <div className="features-grid">
          {featureCards.map((f) => (
            <div key={f.title} className="feat-card">
              <div className="feat-icon">{f.icon}</div>
              <h3 className="feat-title">{f.title}</h3>
              <p className="feat-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="how-section">
        <div className="how-inner">
          <div>
            <div className="section-eyebrow">How it works</div>
            <h2 className="section-title">From draft to approval in a workflow that feels <em>operationally sharp</em></h2>
            <p className="section-sub">The point is not just to generate a document. The point is to move the client from agreement draft to signed decision without chaos.</p>
            <div style={{ marginTop: 48 }}>
              {workflowSteps.map((s) => (
                <div key={s.n} className="step-row">
                  <div className="step-num">{s.n}</div>
                  <div>
                    <div className="step-body-title">{s.t}</div>
                    <p className="step-body-desc">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mock-form">
              <div className="mock-form-title">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="2" width="16" height="16" rx="4" fill="#fce8e4" stroke="#d4826e" strokeWidth="1.4"/>
                  <path d="M5 7h10M5 10h7M5 13h8" stroke="#d4826e" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                New Contract
              </div>
              {[
                { label:"Client Name",   val:"Northwind Studio",    filled:true  },
                { label:"Project Type",  val:"Monthly Retainer",    filled:true  },
              ].map((f) => (
                <div key={f.label} className="mock-field">
                  <span className="mock-label">{f.label}</span>
                  <div className={`mock-input ${f.filled ? "" : "placeholder"}`}>{f.val}</div>
                </div>
              ))}
              <div className="mock-row">
                {[
                  { label:"Total Value", val:"$3,200",  filled:true },
                  { label:"Exclusivity", val:"30 days", filled:true },
                ].map((f) => (
                  <div key={f.label} className="mock-field">
                    <span className="mock-label">{f.label}</span>
                    <div className={`mock-input ${f.filled ? "" : "placeholder"}`}>{f.val}</div>
                  </div>
                ))}
              </div>
              {[
                { label:"Deliverables",  val:"2 Reels · 4 Stories · 1 Post",    filled:true  },
                { label:"Payment Terms", val:"50% upfront · 50% on delivery",   filled:false },
              ].map((f) => (
                <div key={f.label} className="mock-field">
                  <span className="mock-label">{f.label}</span>
                  <div className={`mock-input ${f.filled ? "" : "placeholder"}`}>{f.val}</div>
                </div>
              ))}
              <a href={hasContracts ? "/dashboard/new" : "/register"} className="mock-btn">Generate Contract →</a>
            </div>

            <div className="home-proof-note" style={{ marginTop:14, background:"var(--white)", border:"1px solid rgba(201,168,160,0.3)", borderRadius:18, padding:"18px 20px", display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:38, height:38, borderRadius:"50%", background:"#e8f5e9", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2.5 8l4 4 7-7" stroke="#2e7d32" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:13, fontWeight:600, color:"var(--ink)" }}>
                  {inProgressContract
                    ? `Contract sent to ${inProgressContract.contract_data?.clientEmail || "client"}`
                    : "Contract sent to client@example.com"}
                </div>
                <div style={{ fontFamily:"'Manrope',sans-serif", fontSize:12, color:"var(--muted)", marginTop:2 }}>
                  {inProgressContract ? `Awaiting review · status: ${inProgressContract.status}` : "Awaiting client review with tracked status history"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BillingPlanGrid
        title={<>Pricing that makes sense when contracts are part of your <em>weekly workflow</em></>}
        subtitle="Choose based on how often you send agreements and how much operational structure you need around them. Every plan keeps the same core review and approval flow."
      />

      {/* ── TESTIMONIALS ── */}
      <section id="reviews" className="testi-section">
        <div className="testi-head">
          <div className="section-eyebrow">Use cases</div>
          <h2 className="section-title">Where this workflow feels most <em>immediately valuable</em></h2>
          <p className="section-sub">Contrakt fits best when client scope, approvals, and timelines are frequent enough to become operational overhead.</p>
        </div>
        <div className="testi-grid">
          {useCases.map((t) => (
            <div key={t.name} className="testi-card">
              <div className="testi-stars">
                {[1,2,3,4,5].map((s) => (
                  <svg key={s} width="14" height="14" viewBox="0 0 14 14" fill="#d4826e">
                    <path d="M7 1l1.6 3.6 3.9.6-2.8 2.7.7 3.9L7 10.2l-3.4 1.6.7-3.9L1.5 5.2l3.9-.6L7 1z"/>
                  </svg>
                ))}
              </div>
              <p className="testi-quote">&quot;{t.q}&quot;</p>
              <div className="testi-author">
                <div className="testi-av" style={{ background:t.bg, color:t.fg }}>{t.i}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-handle">{t.handle}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="cta-wrap">
        <div className="cta-box">
          <div className="cta-deco cta-deco-1" />
          <div className="cta-deco cta-deco-2" />
          <h2 className="cta-title">Upgrade from scattered approvals to a<br /><em>clean contract operating system</em></h2>
          <p className="cta-sub">If client work moves through scopes, approvals, edits, and signatures every week, this should feel like operational relief, not another tool to babysit.</p>
          <div className="cta-actions">
            <a href="/register" className="btn-cta-primary">
              Create your first contract
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="/login" className="btn-cta-ghost">Log in to my account</a>
            <LemonSqueezyCheckoutButton
              label="Unlock paid workflow"
              className="btn-cta-ghost"
              planId="pro"
              redirectPath="/dashboard"
            />
          </div>
          <p className="cta-note">Transparent monthly pricing · Client-ready review links · Acceptance records attached to every deal</p>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <Link href="/" className="logo">
            <div className="logo-mark" style={{ width:30, height:30, borderRadius:8 }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path d="M3 4.5h12M3 9h8M3 13.5h10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="logo-text" style={{ fontSize:18 }}>Contrakt</span>
          </Link>
          <div className="footer-links">
            <a href="#features" className="footer-link">Features</a>
            <a href="#how-it-works" className="footer-link">How it works</a>
            <a href="#reviews" className="footer-link">Use cases</a>
            <a href="#" className="footer-link">Top</a>
          </div>
          <p className="footer-copy">© {currentYear} Contrakt. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
