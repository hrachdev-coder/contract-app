import Link from "next/link";
import "./home.css";
import HomeHeader from "./components/HomeHeader";
import BillingPlanGrid from "./components/BillingPlanGrid";
import LemonSqueezyCheckoutButton from "./components/LemonSqueezyCheckoutButton";
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

  return (
    <div style={{ fontFamily: "sans-serif", background: "var(--background)", minHeight: "100vh" }}>

      {/* ── NAV ── */}
      <HomeHeader />

      {/* ── HERO ── */}
      <section className="hero">
        <div>
          <div className="hero-eyebrow">
            <span className="eyebrow-dot" />
            Built for service businesses worldwide
          </div>
          <h1 className="hero-title">
            Your client contracts,<br /><em>handled </em> with elegance
          </h1>
          <p className="hero-sub">
            Generate professional client contracts in minutes, send them for signature, and track every step from one beautiful dashboard.
          </p>
          <div className="hero-actions">
            <a href="/register" className="btn-hero-primary">
              Start for free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="/login" className="btn-hero-secondary">
              Already a member? Log in
            </a>
            <LemonSqueezyCheckoutButton
              label="Go Pro"
              className="btn-ghost"
              planId="pro"
              redirectPath="/dashboard"
            />
          </div>
          <div className="hero-trust">
            <div className="trust-avatars">
              {[
                { bg:"#f7d5ce", color:"#a04030", t:"S" },
                { bg:"#dde8f5", color:"#305080", t:"A" },
                { bg:"#e0f0e0", color:"#306040", t:"J" },
                { bg:"#f5e0f5", color:"#703070", t:"M" },
              ].map((a,i) => (
                <div key={i} className="trust-avatar" style={{ background: a.bg, color: a.color }}>{a.t}</div>
              ))}
            </div>
            <p className="trust-text"><strong>Global-ready</strong> workflow for service teams</p>
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
              {hasContracts ? "Your Contracts Overview" : "Dashboard Preview"}
            </div>
            <div className="amount-display">{formatAmount(totalValue, defaultCurrency)}</div>
            <div className="amount-label">
              {hasContracts
                ? `Total contract value · ${contracts.length} contracts`
                : "Sign in to load your live contract data"}
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
            { n:"Fast", e:"", l:"Setup and onboarding" },
            { n:"Clear", e:"", l:"Client review flow" },
            { n:"Secure", e:"", l:"Audit-ready records" },
          ].map((s,i) => (
            <div key={i} className="stat-cell">
              <div className="stat-num">{s.n}<em>{s.e}</em></div>
              <div className="stat-lbl">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="features-section">
        <div className="features-head">
          <div className="section-eyebrow">Features</div>
          <h2 className="section-title">Everything you need to<br /><em>close deals effortlessly</em></h2>
          <p className="section-sub">Built for freelancers, agencies, and consultants who want to run contracts without the complexity.</p>
        </div>
        <div className="features-grid">
          {[
            {
              icon: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="3" y="3" width="20" height="20" rx="5" stroke="#d4826e" strokeWidth="1.6"/><path d="M8 9h10M8 13h7M8 17h5" stroke="#d4826e" strokeWidth="1.6" strokeLinecap="round"/><circle cx="20" cy="20" r="5" fill="#fce8e4" stroke="#d4826e" strokeWidth="1.4"/><path d="M18.5 20l1 1 2.5-2" stroke="#d4826e" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              title: "Smart Contract Builder",
              desc: "Answer a few questions and generate a clean, professional contract draft ready to send.",
            },
            {
              icon: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M4 6h18v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" stroke="#d4826e" strokeWidth="1.6"/><path d="M9 6V4M17 6V4M4 11h18" stroke="#d4826e" strokeWidth="1.6" strokeLinecap="round"/><path d="M9 16l2 2 4-4" stroke="#d4826e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              title: "E-Signature & Invitations",
              desc: "Send contracts directly to clients via email. They review and e-sign in one click, with no account required.",
            },
            {
              icon: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><circle cx="13" cy="13" r="9" stroke="#d4826e" strokeWidth="1.6"/><path d="M13 8v5.5l3.5 3.5" stroke="#d4826e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              title: "Real-Time Status Tracking",
              desc: "Track every contract state at a glance, from sent to reviewed to accepted.",
            },
            {
              icon: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="3" y="7" width="20" height="15" rx="3" stroke="#d4826e" strokeWidth="1.6"/><path d="M17 7V6a4 4 0 00-8 0v1" stroke="#d4826e" strokeWidth="1.6" strokeLinecap="round"/><circle cx="13" cy="14" r="2.5" stroke="#d4826e" strokeWidth="1.5"/><path d="M13 16.5v2" stroke="#d4826e" strokeWidth="1.5" strokeLinecap="round"/></svg>,
              title: "Secure & Legally Binding",
              desc: "Each acceptance records consent text, timestamp, and audit metadata for stronger documentation.",
            },
            {
              icon: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="3" y="3" width="9" height="9" rx="2" stroke="#d4826e" strokeWidth="1.6"/><rect x="14" y="3" width="9" height="9" rx="2" stroke="#d4826e" strokeWidth="1.6"/><rect x="3" y="14" width="9" height="9" rx="2" stroke="#d4826e" strokeWidth="1.6"/><circle cx="18.5" cy="18.5" r="4.5" fill="#fce8e4" stroke="#d4826e" strokeWidth="1.4"/><path d="M17 18.5h3M18.5 17v3" stroke="#d4826e" strokeWidth="1.3" strokeLinecap="round"/></svg>,
              title: "Contract Dashboard",
              desc: "All your contracts, payment statuses, and deadlines in one elegant view — no spreadsheets required.",
            },
            {
              icon: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M13 3l2.8 6 6.2.9-4.5 4.4 1 6.2-5.5-2.8-5.5 2.8 1-6.2-4.5-4.4 6.2-.9L13 3z" stroke="#d4826e" strokeWidth="1.6" strokeLinejoin="round" fill="#fce8e4"/></svg>,
              title: "Ready-Made Templates",
              desc: "Start from practical templates for services, project scopes, retainers, and licensing terms.",
            },
          ].map((f) => (
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
            <h2 className="section-title">From idea to <em>signed deal</em><br />in four steps</h2>
            <p className="section-sub">No legal background needed. No confusing tools. Just a beautiful, guided flow.</p>
            <div style={{ marginTop: 48 }}>
              {[
                { n:"01", t:"Fill in contract details", d:"Enter client info, deliverables, compensation, usage rights and exclusivity. Our builder guides every clause." },
                { n:"02", t:"Generate your contract",   d:"Contrakt produces a polished PDF contract with your details and full legal protections built in." },
                { n:"03", t:"Send & get signed",        d:"Email the contract link to your client contact. They review, request changes if needed, and e-sign instantly." },
                { n:"04", t:"Manage & get paid",        d:"Track milestones and payment deadlines from your dashboard. Stay on top of every contract, effortlessly." },
              ].map((s) => (
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

            <div style={{ marginTop:14, background:"var(--white)", border:"1px solid rgba(201,168,160,0.3)", borderRadius:18, padding:"18px 20px", display:"flex", alignItems:"center", gap:14 }}>
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
                  {inProgressContract ? `Awaiting review · status: ${inProgressContract.status}` : "Awaiting client review"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BillingPlanGrid />

      {/* ── TESTIMONIALS ── */}
      <section id="reviews" className="testi-section">
        <div className="testi-head">
          <div className="section-eyebrow">Use Cases</div>
          <h2 className="section-title">How teams use <em>Contrakt</em></h2>
          <p className="section-sub">Illustrative examples of common contract workflows across different service businesses.</p>
        </div>
        <div className="testi-grid">
          {[
            { q:"Creative studios can centralize approvals, revision requests, and final sign-off in one place.", name:"Creative Studio", handle:"Example workflow", bg:"#fde8e4", fg:"#a04030", i:"CS" },
            { q:"Consultants can send clear scopes and collect acceptance before kickoff to reduce ambiguity.", name:"Independent Consultant", handle:"Example workflow", bg:"#e8eaf6", fg:"#3949ab", i:"IC" },
            { q:"Agencies can keep templates consistent across clients while tracking every contract from sent to completed.", name:"Client Services Agency", handle:"Example workflow", bg:"#e8f5e9", fg:"#2e7d32", i:"CA" },
          ].map((t) => (
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
          <h2 className="cta-title">Ready to run contracts like a<br /><em>professional team?</em></h2>
          <p className="cta-sub">Join 240+ freelancers and agencies who close deals faster and get paid on time.</p>
          <div className="cta-actions">
            <a href="/register" className="btn-cta-primary">
              Create your first contract
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="/login" className="btn-cta-ghost">Log in to my account</a>
            <LemonSqueezyCheckoutButton
              label="Upgrade with LemonSqueezy"
              className="btn-cta-ghost"
              planId="pro"
              redirectPath="/dashboard"
            />
          </div>
          <p className="cta-note">Transparent monthly pricing · Choose the plan that fits your workflow</p>
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
