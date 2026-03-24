import Link from "next/link";
import "./home.css";
import HomeHeader from "./components/HomeHeader";

export default function HomePage() {

  return (
    <div style={{ fontFamily: "sans-serif", background: "var(--background)", minHeight: "100vh" }}>

      {/* ── NAV ── */}
      <HomeHeader />

      {/* ── HERO ── */}
      <section className="hero">
        <div>
          <div className="hero-eyebrow">
            <span className="eyebrow-dot" />
            Trusted by 3,400+ creators
          </div>
          <h1 className="hero-title">
            Your brand deals,<br /><em>handled</em> with elegance
          </h1>
          <p className="hero-sub">
            Generate professional influencer contracts in minutes, send them to brands, and track every signature — from one beautiful dashboard.
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
            <p className="trust-text"><strong>3,400+</strong> creators already closing deals faster</p>
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
              <div className="float-title">Contract Signed ✓</div>
              <div className="float-sub">Zara × @maya.style — just now</div>
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
              <div className="float-title">Awaiting Review</div>
              <div className="float-sub">Nike campaign · $6,200</div>
            </div>
          </div>

          <div className="card-main">
            <div className="card-chip">
              <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#d4826e"/></svg>
              Q4 Campaigns Overview
            </div>
            <div className="amount-display">$24,800</div>
            <div className="amount-label">Total contract value · Oct–Dec 2024</div>
            <div className="progress-bar-wrap"><div className="progress-bar-fill" /></div>
            <div className="progress-meta"><span>72% collected</span><span>$17,856 received</span></div>
            <div className="contract-items">
              {[
                { b:"Z", name:"Zara",       sub:"2 Reels · 4 Stories",  val:"$3,200", dot:"#4caf50", cls:"badge-signed",  s:"signed"  },
                { b:"N", name:"Nike",        sub:"3 Reels · 1 Post",     val:"$6,200", dot:"#ff9800", cls:"badge-pending", s:"pending" },
                { b:"A", name:"Aesop",       sub:"1 Reel · 2 Stories",   val:"$1,800", dot:"#e91e63", cls:"badge-review",  s:"review"  },
                { b:"D", name:"Dior Beauty", sub:"4 Posts · 6 Stories",  val:"$9,400", dot:"#4caf50", cls:"badge-signed",  s:"signed"  },
              ].map((c) => (
                <div key={c.name} className="citem">
                  <div className="citem-left">
                    <div className="citem-dot" style={{ background: c.dot }} />
                    <div>
                      <div className="citem-name">{c.b} — {c.name}</div>
                      <div className="citem-sub">{c.sub}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"'Jost',sans-serif", fontSize:13, fontWeight:600, color:"var(--ink)", marginBottom:4 }}>{c.val}</div>
                    <span className={`citem-badge ${c.cls}`}>{c.s}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="stats-row">
        <div className="stats-inner">
          {[
            { n:"3,400", e:"+",  l:"Active creators"     },
            { n:"$12",   e:"M+", l:"Contracts generated" },
            { n:"98",    e:"%",  l:"Satisfaction rate"   },
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
          <p className="section-sub">Built for influencers who take their business seriously — without the complexity.</p>
        </div>
        <div className="features-grid">
          {[
            {
              icon: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="3" y="3" width="20" height="20" rx="5" stroke="#d4826e" strokeWidth="1.6"/><path d="M8 9h10M8 13h7M8 17h5" stroke="#d4826e" strokeWidth="1.6" strokeLinecap="round"/><circle cx="20" cy="20" r="5" fill="#fce8e4" stroke="#d4826e" strokeWidth="1.4"/><path d="M18.5 20l1 1 2.5-2" stroke="#d4826e" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              title: "Smart Contract Builder",
              desc: "Answer a few questions and get a professionally formatted, legally-sound contract ready to send — in under 3 minutes.",
            },
            {
              icon: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M4 6h18v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" stroke="#d4826e" strokeWidth="1.6"/><path d="M9 6V4M17 6V4M4 11h18" stroke="#d4826e" strokeWidth="1.6" strokeLinecap="round"/><path d="M9 16l2 2 4-4" stroke="#d4826e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              title: "E-Signature & Invitations",
              desc: "Send contracts directly to brands via email. They review and e-sign in one click — no account needed on their end.",
            },
            {
              icon: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><circle cx="13" cy="13" r="9" stroke="#d4826e" strokeWidth="1.6"/><path d="M13 8v5.5l3.5 3.5" stroke="#d4826e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              title: "Real-Time Status Tracking",
              desc: "See every contract's status at a glance — opened, pending, signed, or overdue. Never chase a signature again.",
            },
            {
              icon: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="3" y="7" width="20" height="15" rx="3" stroke="#d4826e" strokeWidth="1.6"/><path d="M17 7V6a4 4 0 00-8 0v1" stroke="#d4826e" strokeWidth="1.6" strokeLinecap="round"/><circle cx="13" cy="14" r="2.5" stroke="#d4826e" strokeWidth="1.5"/><path d="M13 16.5v2" stroke="#d4826e" strokeWidth="1.5" strokeLinecap="round"/></svg>,
              title: "Secure & Legally Binding",
              desc: "Every signature includes a full audit trail, IP log, and timestamp — accepted as legally binding in 90+ countries.",
            },
            {
              icon: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><rect x="3" y="3" width="9" height="9" rx="2" stroke="#d4826e" strokeWidth="1.6"/><rect x="14" y="3" width="9" height="9" rx="2" stroke="#d4826e" strokeWidth="1.6"/><rect x="3" y="14" width="9" height="9" rx="2" stroke="#d4826e" strokeWidth="1.6"/><circle cx="18.5" cy="18.5" r="4.5" fill="#fce8e4" stroke="#d4826e" strokeWidth="1.4"/><path d="M17 18.5h3M18.5 17v3" stroke="#d4826e" strokeWidth="1.3" strokeLinecap="round"/></svg>,
              title: "Campaign Dashboard",
              desc: "All your campaigns, payment statuses, and deadlines in one elegant view — no spreadsheets required.",
            },
            {
              icon: <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M13 3l2.8 6 6.2.9-4.5 4.4 1 6.2-5.5-2.8-5.5 2.8 1-6.2-4.5-4.4 6.2-.9L13 3z" stroke="#d4826e" strokeWidth="1.6" strokeLinejoin="round" fill="#fce8e4"/></svg>,
              title: "Ready-Made Templates",
              desc: "Start from our library: sponsored posts, ambassador deals, usage licensing, gifting campaigns — crafted by legal experts.",
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
                { n:"01", t:"Fill in campaign details", d:"Enter brand info, deliverables, compensation, usage rights and exclusivity. Our builder guides every clause." },
                { n:"02", t:"Generate your contract",   d:"Contrakt produces a polished PDF contract with your details and full legal protections built in." },
                { n:"03", t:"Send & get signed",        d:"Email the contract link to your brand contact. They review, request changes if needed, and e-sign instantly." },
                { n:"04", t:"Manage & get paid",        d:"Track milestones and payment deadlines from your dashboard. Stay on top of every campaign, effortlessly." },
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
                { label:"Brand Name",    val:"Zara International", filled:true  },
                { label:"Campaign Type", val:"Sponsored Post",      filled:true  },
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
              <button className="mock-btn">Generate Contract →</button>
            </div>

            <div style={{ marginTop:14, background:"var(--white)", border:"1px solid rgba(201,168,160,0.3)", borderRadius:18, padding:"18px 20px", display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:38, height:38, borderRadius:"50%", background:"#e8f5e9", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2.5 8l4 4 7-7" stroke="#2e7d32" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily:"'Jost',sans-serif", fontSize:13, fontWeight:600, color:"var(--ink)" }}>Contract sent to brand@zara.com</div>
                <div style={{ fontFamily:"'Jost',sans-serif", fontSize:12, color:"var(--muted)", marginTop:2 }}>Awaiting e-signature · expires in 7 days</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="reviews" className="testi-section">
        <div className="testi-head">
          <div className="section-eyebrow">Testimonials</div>
          <h2 className="section-title">Creators who <em>love</em> Contrakt</h2>
          <p className="section-sub">Real stories from influencers who transformed how they manage brand deals.</p>
        </div>
        <div className="testi-grid">
          {[
            { q:"Before Contrakt, I was sending Word docs back and forth for weeks. Now I close campaigns in an afternoon. It completely changed how I run my business.", name:"Sofia Martinez", handle:"@sofia.creates · 420K", bg:"#fde8e4", fg:"#a04030", i:"SM" },
            { q:"I've had brands ghost me after agreeing to terms. Now everything is signed before I lift a finger. The peace of mind alone is worth it.", name:"James Park", handle:"@parklife.james · 185K", bg:"#e8eaf6", fg:"#3949ab", i:"JP" },
            { q:"The templates are incredible. I used to pay $300 per contract. Now I handle everything in 5 minutes and it looks way more professional.", name:"Anika Osei", handle:"@anika.lifestyle · 870K", bg:"#e8f5e9", fg:"#2e7d32", i:"AO" },
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
          <h2 className="cta-title">Ready to work like a<br /><em>professional creator?</em></h2>
          <p className="cta-sub">Join 3,400+ influencers who close deals faster and always get paid on time.</p>
          <div className="cta-actions">
            <a href="/register" className="btn-cta-primary">
              Create your first contract
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="/login" className="btn-cta-ghost">Log in to my account</a>
          </div>
          <p className="cta-note">Free to start · No credit card required · Cancel anytime</p>
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
            {["Privacy","Terms","Support","Blog"].map((l) => (
              <a key={l} href={`/${l.toLowerCase()}`} className="footer-link">{l}</a>
            ))}
          </div>
          <p className="footer-copy">© 2025 Contrakt. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
