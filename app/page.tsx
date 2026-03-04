export default function HomePage() {

  return (
    <div style={{ fontFamily: "sans-serif", background: "#fdf8f5", minHeight: "100vh" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <style suppressHydrationWarning>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --rose:    #f2c4c4;
          --blush:   #f7ddd5;
          --cream:   #fdf8f5;
          --sand:    #f0e6df;
          --mauve:   #c9a8a0;
          --deep:    #3d2c2c;
          --ink:     #1e1414;
          --muted:   #9d8080;
          --white:   #ffffff;
          --accent:  #d4826e;
        }

        /* ── NAV ── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          background: rgba(253,248,245,0.85);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(201,168,160,0.25);
        }
        .nav-inner {
          max-width: 1180px; margin: 0 auto;
          padding: 0 36px; height: 72px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .logo-mark {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #e8b4a8, #c9887a);
          display: flex; align-items: center; justify-content: center;
        }
        .logo-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 600; color: var(--ink); letter-spacing: 0.02em;
        }
        .nav-links { display: flex; align-items: center; gap: 36px; }
        .nav-link {
          font-family: 'Jost', sans-serif; font-size: 13px; font-weight: 400;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--muted); text-decoration: none; transition: color 0.2s;
        }
        .nav-link:hover { color: var(--ink); }
        .nav-divider { width: 1px; height: 20px; background: var(--rose); }
        .btn-ghost {
          font-family: 'Jost', sans-serif; font-size: 13px; font-weight: 500;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--ink); background: none;
          border: 1.5px solid var(--mauve); border-radius: 100px; padding: 9px 22px;
          cursor: pointer; transition: all 0.2s;
          text-decoration: none; display: inline-flex; align-items: center;
        }
        .btn-ghost:hover { background: var(--sand); border-color: var(--accent); }
        .btn-filled {
          font-family: 'Jost', sans-serif; font-size: 13px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--white);
          background: linear-gradient(135deg, #d4826e, #c06e5a);
          border: none; border-radius: 100px; padding: 10px 24px;
          cursor: pointer; transition: all 0.25s;
          box-shadow: 0 4px 18px rgba(192,110,90,0.35);
          text-decoration: none; display: inline-flex; align-items: center;
        }
        .btn-filled:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(192,110,90,0.45); }

        /* ── HERO ── */
        .hero {
          padding: 160px 36px 100px; max-width: 1180px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
        }
        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--white); border: 1px solid var(--rose); border-radius: 100px;
          padding: 6px 16px; font-family: 'Jost', sans-serif;
          font-size: 11px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--accent); margin-bottom: 28px;
        }
        .eyebrow-dot {
          width: 5px; height: 5px; border-radius: 50%; background: var(--accent);
          animation: blink 2.4s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(52px, 5.5vw, 80px); font-weight: 300;
          color: var(--ink); line-height: 1.08; letter-spacing: -0.01em; margin-bottom: 28px;
        }
        .hero-title em {
          font-style: italic; font-weight: 600;
          background: linear-gradient(135deg, #d4826e, #c06e5a);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .hero-sub {
          font-family: 'Jost', sans-serif; font-size: 16px; font-weight: 300;
          line-height: 1.75; color: var(--muted); max-width: 420px; margin-bottom: 44px;
        }
        .hero-actions { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .btn-hero-primary {
          font-family: 'Jost', sans-serif; font-size: 14px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase; color: var(--white);
          background: linear-gradient(135deg, #d4826e, #b5614e);
          border: none; border-radius: 100px; padding: 16px 36px;
          cursor: pointer; transition: all 0.25s;
          box-shadow: 0 8px 30px rgba(180,97,78,0.4);
          display: flex; align-items: center; gap: 10px;
        }
        .btn-hero-primary:hover { transform: translateY(-2px); box-shadow: 0 14px 38px rgba(180,97,78,0.5); }
        .btn-hero-secondary {
          font-family: 'Jost', sans-serif; font-size: 14px; font-weight: 400;
          color: var(--muted); background: none;
          display: flex; align-items: center; gap: 8px; transition: color 0.2s;
          text-decoration: underline; text-underline-offset: 3px; text-decoration-color: var(--rose);
        }
        .btn-hero-secondary:hover { color: var(--accent); }
        .hero-trust { display: flex; align-items: center; gap: 12px; margin-top: 36px; }
        .trust-avatars { display: flex; }
        .trust-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          border: 2px solid var(--cream);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 600;
          margin-left: -8px;
        }
        .trust-avatar:first-child { margin-left: 0; }
        .trust-text { font-family: 'Jost', sans-serif; font-size: 12px; font-weight: 300; color: var(--muted); }
        .trust-text strong { font-weight: 600; color: var(--ink); }

        /* hero visual */
        .hero-visual { position: relative; }
        .card-main {
          background: var(--white); border: 1px solid rgba(201,168,160,0.3); border-radius: 28px;
          padding: 32px; position: relative; z-index: 2;
          box-shadow: 0 24px 64px rgba(61,44,44,0.1), 0 4px 16px rgba(61,44,44,0.05);
        }
        .card-chip {
          display: inline-flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg, #fce8e4, #f7d5ce);
          border-radius: 100px; padding: 6px 14px;
          font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 500;
          letter-spacing: 0.05em; color: var(--accent); margin-bottom: 20px;
        }
        .amount-display {
          font-family: 'Cormorant Garamond', serif;
          font-size: 48px; font-weight: 300; color: var(--ink); line-height: 1; margin-bottom: 6px;
        }
        .amount-label {
          font-family: 'Jost', sans-serif; font-size: 12px; font-weight: 400;
          color: var(--muted); letter-spacing: 0.04em; margin-bottom: 28px;
        }
        .progress-bar-wrap {
          background: var(--sand); border-radius: 100px; height: 6px;
          margin-bottom: 8px; overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%; border-radius: 100px; width: 72%;
          background: linear-gradient(90deg, #f2b4a8, #d4826e);
        }
        .progress-meta {
          display: flex; justify-content: space-between;
          font-family: 'Jost', sans-serif; font-size: 11px; color: var(--muted); margin-bottom: 28px;
        }
        .contract-items { display: flex; flex-direction: column; gap: 12px; }
        .citem {
          display: flex; align-items: center; justify-content: space-between;
          background: var(--cream); border-radius: 14px; padding: 14px 18px;
        }
        .citem-left { display: flex; align-items: center; gap: 12px; }
        .citem-dot { width: 8px; height: 8px; border-radius: 50%; }
        .citem-name { font-family: 'Jost', sans-serif; font-size: 13px; font-weight: 500; color: var(--ink); }
        .citem-sub { font-family: 'Jost', sans-serif; font-size: 11px; color: var(--muted); margin-top: 2px; }
        .citem-badge {
          font-family: 'Jost', sans-serif; font-size: 10px; font-weight: 600;
          letter-spacing: 0.05em; border-radius: 100px; padding: 4px 10px; text-transform: uppercase;
        }
        .badge-signed  { background: #e8f5e9; color: #2e7d32; }
        .badge-pending { background: #fff8e1; color: #f57f17; }
        .badge-review  { background: #fce4ec; color: #c2185b; }

        .float-card {
          position: absolute; background: var(--white);
          border: 1px solid rgba(201,168,160,0.35); border-radius: 18px; padding: 14px 18px;
          box-shadow: 0 12px 36px rgba(61,44,44,0.12);
          display: flex; align-items: center; gap: 12px; white-space: nowrap; z-index: 3;
        }
        .float-1 { top: -22px; right: -28px; animation: floatA 4s ease-in-out infinite; }
        .float-2 { bottom: 30px; left: -36px; animation: floatB 4s ease-in-out infinite 2s; }
        @keyframes floatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
        @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(7px)} }
        .float-icon {
          width: 36px; height: 36px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
        }
        .float-title { font-family: 'Jost', sans-serif; font-size: 13px; font-weight: 600; color: var(--ink); }
        .float-sub   { font-family: 'Jost', sans-serif; font-size: 11px; color: var(--muted); margin-top: 1px; }

        /* ── STATS ── */
        .stats-row { max-width: 1180px; margin: 0 auto 80px; padding: 0 36px; }
        .stats-inner {
          background: var(--white); border: 1px solid rgba(201,168,160,0.3); border-radius: 24px;
          display: grid; grid-template-columns: repeat(3,1fr); overflow: hidden;
        }
        .stat-cell {
          padding: 40px 32px; text-align: center;
          border-right: 1px solid rgba(201,168,160,0.2);
        }
        .stat-cell:last-child { border-right: none; }
        .stat-num { font-family: 'Cormorant Garamond', serif; font-size: 52px; font-weight: 300; color: var(--ink); line-height: 1; }
        .stat-num em { font-style: italic; color: var(--accent); }
        .stat-lbl {
          font-family: 'Jost', sans-serif; font-size: 12px; font-weight: 400;
          letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); margin-top: 8px;
        }

        /* ── SECTIONS ── */
        .section-eyebrow {
          font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 500;
          letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); margin-bottom: 14px;
        }
        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(34px, 4vw, 52px); font-weight: 300; color: var(--ink); line-height: 1.15;
        }
        .section-title em { font-style: italic; font-weight: 600; color: var(--accent); }
        .section-sub {
          font-family: 'Jost', sans-serif; font-size: 15px; font-weight: 300;
          line-height: 1.75; color: var(--muted); margin-top: 16px; max-width: 480px;
        }

        /* ── FEATURES ── */
        .features-section { max-width: 1180px; margin: 0 auto; padding: 40px 36px 100px; }
        .features-head { text-align: center; margin-bottom: 60px; }
        .features-head .section-sub { margin: 16px auto 0; }
        .features-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
        .feat-card {
          background: var(--white); border: 1px solid rgba(201,168,160,0.25);
          border-radius: 24px; padding: 36px 30px;
          transition: all 0.3s ease; position: relative; overflow: hidden;
        }
        .feat-card::after {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #f2b4a8, #d4826e); opacity: 0; transition: opacity 0.3s;
        }
        .feat-card:hover { transform: translateY(-6px); box-shadow: 0 24px 56px rgba(61,44,44,0.1); }
        .feat-card:hover::after { opacity: 1; }
        .feat-icon {
          width: 56px; height: 56px; border-radius: 18px;
          background: linear-gradient(135deg, #fce8e4, #f5d0c8);
          display: flex; align-items: center; justify-content: center; margin-bottom: 24px;
        }
        .feat-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 600; color: var(--ink); margin-bottom: 12px; }
        .feat-desc { font-family: 'Jost', sans-serif; font-size: 14px; font-weight: 300; line-height: 1.7; color: var(--muted); }

        /* ── HOW IT WORKS ── */
        .how-section {
          background: var(--white);
          border-top: 1px solid rgba(201,168,160,0.2); border-bottom: 1px solid rgba(201,168,160,0.2);
          padding: 100px 36px;
        }
        .how-inner {
          max-width: 1180px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr; gap: 90px; align-items: center;
        }
        .step-row {
          display: flex; gap: 28px; align-items: flex-start;
          padding: 28px 0; border-bottom: 1px solid rgba(201,168,160,0.18);
        }
        .step-row:last-child { border-bottom: none; }
        .step-num {
          font-family: 'Cormorant Garamond', serif; font-size: 42px; font-weight: 300;
          color: var(--rose); line-height: 1; flex-shrink: 0; width: 48px;
        }
        .step-body-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 600; color: var(--ink); margin-bottom: 8px; }
        .step-body-desc { font-family: 'Jost', sans-serif; font-size: 14px; font-weight: 300; line-height: 1.7; color: var(--muted); }

        .mock-form { background: var(--cream); border: 1px solid rgba(201,168,160,0.3); border-radius: 28px; padding: 32px; }
        .mock-form-title {
          font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 600; color: var(--ink);
          margin-bottom: 24px; display: flex; align-items: center; gap: 10px;
        }
        .mock-field { margin-bottom: 14px; }
        .mock-label {
          font-family: 'Jost', sans-serif; font-size: 10px; font-weight: 500;
          letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; display: block;
        }
        .mock-input {
          background: var(--white); border: 1px solid rgba(201,168,160,0.4);
          border-radius: 12px; padding: 12px 16px;
          font-family: 'Jost', sans-serif; font-size: 14px; color: var(--ink); width: 100%;
        }
        .mock-input.placeholder { color: var(--muted); font-style: italic; }
        .mock-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .mock-btn {
          width: 100%; margin-top: 20px;
          background: linear-gradient(135deg, #d4826e, #b5614e);
          color: var(--white); border: none; border-radius: 14px; padding: 14px;
          font-family: 'Jost', sans-serif; font-size: 13px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer;
          box-shadow: 0 6px 20px rgba(180,97,78,0.35);
        }

        /* ── TESTIMONIALS ── */
        .testi-section { max-width: 1180px; margin: 0 auto; padding: 100px 36px; }
        .testi-head { text-align: center; margin-bottom: 60px; }
        .testi-head .section-sub { margin: 16px auto 0; }
        .testi-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
        .testi-card {
          background: var(--white); border: 1px solid rgba(201,168,160,0.25);
          border-radius: 24px; padding: 32px;
        }
        .testi-stars { display: flex; gap: 3px; margin-bottom: 20px; }
        .testi-quote {
          font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 300; font-style: italic;
          color: var(--ink); line-height: 1.65; margin-bottom: 26px;
        }
        .testi-author { display: flex; align-items: center; gap: 12px; }
        .testi-av {
          width: 44px; height: 44px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Jost', sans-serif; font-size: 14px; font-weight: 600; flex-shrink: 0;
        }
        .testi-name { font-family: 'Jost', sans-serif; font-size: 14px; font-weight: 500; color: var(--ink); }
        .testi-handle { font-family: 'Jost', sans-serif; font-size: 12px; font-weight: 300; color: var(--muted); margin-top: 2px; }

        /* ── CTA ── */
        .cta-wrap { padding: 0 36px 100px; max-width: 1180px; margin: 0 auto; }
        .cta-box {
          background: linear-gradient(135deg, #3d2c2c 0%, #5a3a3a 100%);
          border-radius: 36px; padding: 80px 60px; text-align: center; position: relative; overflow: hidden;
        }
        .cta-deco {
          position: absolute; border-radius: 50%;
          background: radial-gradient(circle, rgba(242,180,168,0.18), transparent 70%); pointer-events: none;
        }
        .cta-deco-1 { width: 500px; height: 500px; top: -150px; left: -100px; }
        .cta-deco-2 { width: 400px; height: 400px; bottom: -100px; right: -80px; }
        .cta-title {
          font-family: 'Cormorant Garamond', serif; font-size: clamp(36px, 4.5vw, 60px);
          font-weight: 300; color: #fdf8f5; line-height: 1.1; position: relative; z-index: 1; margin-bottom: 18px;
        }
        .cta-title em { font-style: italic; font-weight: 600; color: #f2b4a8; }
        .cta-sub {
          font-family: 'Jost', sans-serif; font-size: 16px; font-weight: 300;
          color: rgba(253,248,245,0.6); margin-bottom: 44px; position: relative; z-index: 1;
        }
        .cta-actions { display: flex; justify-content: center; gap: 14px; flex-wrap: wrap; position: relative; z-index: 1; }
        .btn-cta-primary {
          font-family: 'Jost', sans-serif; font-size: 14px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink);
          background: linear-gradient(135deg, #f2b4a8, #e8917e);
          border: none; border-radius: 100px; padding: 16px 38px; cursor: pointer; transition: all 0.25s;
          box-shadow: 0 8px 28px rgba(232,145,126,0.5);
          display: inline-flex; align-items: center; gap: 10px; text-decoration: none;
        }
        .btn-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(232,145,126,0.6); }
        .btn-cta-ghost {
          font-family: 'Jost', sans-serif; font-size: 14px; font-weight: 400;
          color: rgba(253,248,245,0.7); background: transparent;
          border: 1.5px solid rgba(253,248,245,0.25); border-radius: 100px; padding: 16px 32px;
          cursor: pointer; transition: all 0.2s; text-decoration: none;
          display: inline-flex; align-items: center;
        }
        .btn-cta-ghost:hover { border-color: rgba(253,248,245,0.6); color: #fdf8f5; }
        .cta-note {
          font-family: 'Jost', sans-serif; font-size: 12px; font-weight: 300;
          color: rgba(253,248,245,0.4); margin-top: 28px; position: relative; z-index: 1;
        }

        /* ── FOOTER ── */
        .footer { background: var(--white); border-top: 1px solid rgba(201,168,160,0.2); padding: 40px 36px; }
        .footer-inner {
          max-width: 1180px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;
        }
        .footer-links { display: flex; gap: 28px; }
        .footer-link {
          font-family: 'Jost', sans-serif; font-size: 12px; font-weight: 400;
          letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted);
          text-decoration: none; transition: color 0.2s;
        }
        .footer-link:hover { color: var(--accent); }
        .footer-copy { font-family: 'Jost', sans-serif; font-size: 12px; font-weight: 300; color: var(--muted); }

        /* ── MODAL ── */
        .modal-backdrop {
          position: fixed; inset: 0; z-index: 500;
          background: rgba(30,20,20,0.55); backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center; padding: 24px;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .modal-box {
          background: var(--white); border-radius: 32px;
          width: 100%; max-width: 440px; padding: 48px 44px; position: relative;
          box-shadow: 0 32px 80px rgba(30,20,20,0.25);
          animation: slideUp 0.25s ease;
        }
        @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        .modal-close {
          position: absolute; top: 20px; right: 22px;
          background: var(--sand); border: none; border-radius: 50%;
          width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--muted); font-size: 18px; line-height: 1; transition: all 0.2s;
        }
        .modal-close:hover { background: var(--blush); color: var(--ink); }
        .modal-logo-line { display: flex; align-items: center; gap: 8px; margin-bottom: 32px; }
        .modal-tabs {
          display: flex; background: var(--cream); border-radius: 14px; padding: 4px; margin-bottom: 32px;
        }
        .modal-tab {
          flex: 1; text-align: center;
          font-family: 'Jost', sans-serif; font-size: 13px; font-weight: 500;
          letter-spacing: 0.04em; text-transform: uppercase;
          padding: 10px; border-radius: 11px; cursor: pointer; border: none;
          background: none; color: var(--muted); transition: all 0.2s;
        }
        .modal-tab.active { background: var(--white); color: var(--ink); box-shadow: 0 2px 12px rgba(61,44,44,0.1); }
        .modal-title { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 600; color: var(--ink); margin-bottom: 6px; }
        .modal-sub { font-family: 'Jost', sans-serif; font-size: 13px; font-weight: 300; color: var(--muted); margin-bottom: 28px; }
        .field { margin-bottom: 16px; }
        .field label {
          display: block; font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 500;
          letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); margin-bottom: 7px;
        }
        .field input {
          width: 100%; background: var(--cream);
          border: 1.5px solid rgba(201,168,160,0.4); border-radius: 14px; padding: 13px 16px;
          font-family: 'Jost', sans-serif; font-size: 14px; color: var(--ink);
          outline: none; transition: border-color 0.2s;
        }
        .field input:focus { border-color: var(--accent); }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .submit-btn {
          width: 100%; margin-top: 8px;
          background: linear-gradient(135deg, #d4826e, #b5614e);
          color: var(--white); border: none; border-radius: 14px; padding: 15px;
          font-family: 'Jost', sans-serif; font-size: 14px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer;
          box-shadow: 0 8px 24px rgba(180,97,78,0.38); transition: all 0.2s;
        }
        .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 12px 30px rgba(180,97,78,0.46); }
        .modal-divider {
          display: flex; align-items: center; gap: 12px; margin: 22px 0;
        }
        .modal-divider span {
          font-family: 'Jost', sans-serif; font-size: 11px; color: var(--muted);
          white-space: nowrap; letter-spacing: 0.06em; text-transform: uppercase;
        }
        .modal-divider::before, .modal-divider::after {
          content: ''; flex: 1; height: 1px; background: rgba(201,168,160,0.3);
        }
        .social-btn {
          width: 100%; background: var(--cream);
          border: 1.5px solid rgba(201,168,160,0.35); border-radius: 14px; padding: 12px;
          font-family: 'Jost', sans-serif; font-size: 13px; font-weight: 500; color: var(--ink);
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: all 0.2s; margin-bottom: 10px;
        }
        .social-btn:hover { border-color: var(--mauve); background: var(--blush); }
        .modal-switch {
          text-align: center; margin-top: 20px;
          font-family: 'Jost', sans-serif; font-size: 13px; color: var(--muted);
        }
        .modal-switch button {
          background: none; border: none; cursor: pointer; color: var(--accent);
          font-family: 'Jost', sans-serif; font-size: 13px; font-weight: 600;
          text-decoration: underline; text-underline-offset: 3px;
        }

        @media (max-width: 900px) {
          .hero { grid-template-columns: 1fr; gap: 60px; padding-top: 120px; }
          .hero-visual { display: none; }
          .features-grid { grid-template-columns: 1fr 1fr; }
          .how-inner { grid-template-columns: 1fr; }
          .testi-grid { grid-template-columns: 1fr; }
          .stats-inner { grid-template-columns: 1fr; }
          .stat-cell { border-right: none; border-bottom: 1px solid rgba(201,168,160,0.2); }
          .nav-links { gap: 16px; }
          .nav-link { display: none; }
        }
        @media (max-width: 600px) {
          .features-grid { grid-template-columns: 1fr; }
          .cta-box { padding: 56px 28px; }
          .modal-box { padding: 36px 24px; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="nav-inner">
          <a href="/" className="logo">
            <div className="logo-mark">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 4.5h12M3 9h8M3 13.5h10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="logo-text">Contrakt</span>
          </a>
          <div className="nav-links">
            <a href="#features"     className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How it works</a>
            <a href="#reviews"      className="nav-link">Reviews</a>
            <div className="nav-divider" />
            <a href="/login"    className="btn-ghost">Log in</a>
            <a href="/register" className="btn-filled">Get started</a>
          </div>
        </div>
      </nav>

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
              <p className="testi-quote">"{t.q}"</p>
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
          <a href="/" className="logo">
            <div className="logo-mark" style={{ width:30, height:30, borderRadius:8 }}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path d="M3 4.5h12M3 9h8M3 13.5h10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="logo-text" style={{ fontSize:18 }}>Contrakt</span>
          </a>
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
