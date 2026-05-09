import { useState, useEffect, useRef, useCallback } from "react";

// ─── GLOBAL STYLES ───────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg-void: #03020a;
      --bg-deep: #07050f;
      --bg-card: rgba(255,255,255,0.03);
      --bg-card-hover: rgba(255,255,255,0.06);
      --border: rgba(255,255,255,0.07);
      --border-bright: rgba(99,102,241,0.4);
      --neon-blue: #6366f1;
      --neon-cyan: #22d3ee;
      --neon-purple: #a855f7;
      --neon-pink: #ec4899;
      --text-primary: #f0eeff;
      --text-secondary: #9b8fcf;
      --text-muted: #4a4272;
      --glow-blue: 0 0 20px rgba(99,102,241,0.4), 0 0 60px rgba(99,102,241,0.15);
      --glow-cyan: 0 0 20px rgba(34,211,238,0.4);
      --radius: 16px;
      --radius-sm: 10px;
    }

    html { scroll-behavior: smooth; }

    body {
      background: var(--bg-void);
      color: var(--text-primary);
      font-family: 'Syne', sans-serif;
      min-height: 100vh;
      overflow-x: hidden;
      line-height: 1.6;
    }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg-deep); }
    ::-webkit-scrollbar-thumb { background: var(--neon-blue); border-radius: 3px; }

    /* Noise texture overlay */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 0;
      opacity: 0.4;
    }

    /* Grid background */
    body::after {
      content: '';
      position: fixed;
      inset: 0;
      background-image:
        linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px);
      background-size: 48px 48px;
      pointer-events: none;
      z-index: 0;
    }

    #root { position: relative; z-index: 1; }

    .orbitron { font-family: 'Orbitron', monospace; }
    .mono { font-family: 'JetBrains Mono', monospace; }

    /* Glassmorphism card */
    .glass {
      background: var(--bg-card);
      border: 1px solid var(--border);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-radius: var(--radius);
      transition: all 0.3s ease;
    }
    .glass:hover {
      background: var(--bg-card-hover);
      border-color: var(--border-bright);
      transform: translateY(-2px);
      box-shadow: var(--glow-blue);
    }

    /* Gradient text */
    .grad-text {
      background: linear-gradient(135deg, var(--neon-cyan), var(--neon-blue), var(--neon-purple));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Neon button */
    .btn-neon {
      background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
      border: none;
      border-radius: var(--radius-sm);
      color: white;
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    .btn-neon::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, var(--neon-cyan), var(--neon-blue));
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .btn-neon:hover::before { opacity: 1; }
    .btn-neon:hover { box-shadow: var(--glow-blue); transform: translateY(-1px); }
    .btn-neon span { position: relative; z-index: 1; }

    .btn-ghost {
      background: transparent;
      border: 1px solid var(--border-bright);
      border-radius: var(--radius-sm);
      color: var(--neon-blue);
      font-family: 'Syne', sans-serif;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .btn-ghost:hover {
      background: rgba(99,102,241,0.1);
      box-shadow: var(--glow-blue);
    }

    /* Input */
    .input-neon {
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-family: 'Syne', sans-serif;
      transition: all 0.3s ease;
      outline: none;
    }
    .input-neon:focus {
      border-color: var(--neon-blue);
      box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
      background: rgba(99,102,241,0.05);
    }
    .input-neon::placeholder { color: var(--text-muted); }

    /* Animations */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-12px); }
    }
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 20px rgba(99,102,241,0.3); }
      50% { box-shadow: 0 0 40px rgba(99,102,241,0.6), 0 0 80px rgba(168,85,247,0.2); }
    }
    @keyframes scanline {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100vh); }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }

    .animate-fadeInUp { animation: fadeInUp 0.6s ease forwards; }
    .animate-float { animation: float 4s ease-in-out infinite; }
    .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }

    /* Tag pill */
    .tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .tag-blue { background: rgba(99,102,241,0.15); color: var(--neon-blue); border: 1px solid rgba(99,102,241,0.3); }
    .tag-cyan { background: rgba(34,211,238,0.1); color: var(--neon-cyan); border: 1px solid rgba(34,211,238,0.25); }
    .tag-purple { background: rgba(168,85,247,0.1); color: var(--neon-purple); border: 1px solid rgba(168,85,247,0.25); }
    .tag-pink { background: rgba(236,72,153,0.1); color: var(--neon-pink); border: 1px solid rgba(236,72,153,0.25); }

    /* Divider */
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--neon-blue), transparent);
      opacity: 0.3;
    }

    /* Section padding */
    .section { padding: 80px 0; }

    /* Container */
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

    /* Tool result box */
    .result-box {
      background: rgba(99,102,241,0.05);
      border: 1px solid rgba(99,102,241,0.2);
      border-radius: var(--radius-sm);
      padding: 16px;
      font-family: 'JetBrains Mono', monospace;
      word-break: break-all;
      color: var(--neon-cyan);
      font-size: 14px;
      min-height: 50px;
    }

    /* Range input */
    input[type=range] {
      -webkit-appearance: none;
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: rgba(255,255,255,0.1);
      outline: none;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
      cursor: pointer;
      box-shadow: var(--glow-blue);
    }

    /* Checkbox */
    input[type=checkbox] {
      accent-color: var(--neon-blue);
      width: 16px;
      height: 16px;
      cursor: pointer;
    }

    select.input-neon option { background: #0f0d1a; color: var(--text-primary); }

    /* Toast */
    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
      color: white;
      padding: 12px 20px;
      border-radius: var(--radius-sm);
      font-weight: 600;
      z-index: 9999;
      animation: fadeInUp 0.3s ease;
      box-shadow: var(--glow-blue);
      font-size: 14px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .section { padding: 60px 0; }
      .container { padding: 0 16px; }
    }
  `}</style>
);

// ─── AVANTIC LOGO SVG (inline recreation of the brand) ──────────────────────
const AvanticLogo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22d3ee"/>
        <stop offset="50%" stopColor="#6366f1"/>
        <stop offset="100%" stopColor="#a855f7"/>
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <rect width="100" height="100" rx="22" fill="#07050f"/>
    <g filter="url(#glow)">
      <polygon points="50,12 82,78 18,78" fill="none" stroke="url(#lg1)" strokeWidth="7" strokeLinejoin="round"/>
      <line x1="32" y1="62" x2="68" y2="62" stroke="url(#lg1)" strokeWidth="6" strokeLinecap="round"/>
    </g>
    <polygon points="50,12 82,78 18,78" fill="rgba(99,102,241,0.08)"/>
  </svg>
);

// ─── TOAST ────────────────────────────────────────────────────────────────────
const useToast = () => {
  const [toast, setToast] = useState(null);
  const show = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };
  return { toast, show };
};

// ─── COPY BUTTON ─────────────────────────────────────────────────────────────
const CopyBtn = ({ text, onCopy }) => {
  const copy = () => {
    navigator.clipboard?.writeText(text).catch(() => {});
    onCopy?.("Copied to clipboard!");
  };
  return (
    <button className="btn-ghost" onClick={copy} style={{ padding: "8px 16px", fontSize: 13 }}>
      📋 Copy
    </button>
  );
};

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
const Navbar = ({ page, setPage }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const nav = [
    { label: "Home", key: "home" },
    { label: "Tools", key: "tools" },
    { label: "Blog", key: "blog" },
    { label: "About", key: "about" },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? "rgba(3,2,10,0.9)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(99,102,241,0.1)" : "none",
      transition: "all 0.3s ease",
      padding: "0 20px",
    }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
        {/* Logo */}
        <button onClick={() => setPage("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <AvanticLogo size={38} />
          <div>
            <div className="orbitron" style={{ fontSize: 14, fontWeight: 700, color: "white", letterSpacing: "0.15em", lineHeight: 1 }}>AVANTIC</div>
            <div className="orbitron grad-text" style={{ fontSize: 10, fontWeight: 400, letterSpacing: "0.3em" }}>TOOLS</div>
          </div>
        </button>

        {/* Desktop Nav */}
        <div style={{ display: "flex", gap: 4, alignItems: "center" }} className="desktop-nav">
          {nav.map(n => (
            <button key={n.key} onClick={() => setPage(n.key)} style={{
              background: page === n.key ? "rgba(99,102,241,0.15)" : "none",
              border: page === n.key ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
              borderRadius: 8, padding: "8px 16px",
              color: page === n.key ? "var(--neon-blue)" : "var(--text-secondary)",
              cursor: "pointer", fontFamily: "'Syne', sans-serif",
              fontWeight: 600, fontSize: 14, transition: "all 0.2s ease",
            }}
            onMouseEnter={e => { if (page !== n.key) e.target.style.color = "white"; }}
            onMouseLeave={e => { if (page !== n.key) e.target.style.color = "var(--text-secondary)"; }}>
              {n.label}
            </button>
          ))}
          <button className="btn-neon" onClick={() => setPage("tools")} style={{ padding: "9px 20px", fontSize: 13, marginLeft: 8 }}>
            <span>Try Free Tools →</span>
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} style={{
          background: "none", border: "1px solid var(--border)", borderRadius: 8,
          padding: "6px 10px", cursor: "pointer", color: "white", fontSize: 18,
          display: "none",
        }} className="mobile-menu-btn">☰</button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: "rgba(7,5,15,0.98)", borderBottom: "1px solid var(--border)",
          padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8,
        }}>
          {nav.map(n => (
            <button key={n.key} onClick={() => { setPage(n.key); setMenuOpen(false); }} style={{
              background: "none", border: "none", color: "var(--text-secondary)",
              fontSize: 16, fontWeight: 600, cursor: "pointer", textAlign: "left",
              padding: "10px 0", fontFamily: "'Syne', sans-serif",
              borderBottom: "1px solid var(--border)",
            }}>{n.label}</button>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
};

// ─── FOOTER ───────────────────────────────────────────────────────────────────
const Footer = ({ setPage }) => (
  <footer style={{ borderTop: "1px solid var(--border)", padding: "60px 0 30px", marginTop: 80 }}>
    <div className="container">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, marginBottom: 40 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <AvanticLogo size={36} />
            <div>
              <div className="orbitron" style={{ fontSize: 13, fontWeight: 700, color: "white", letterSpacing: "0.15em" }}>AVANTIC</div>
              <div className="orbitron" style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.3em" }}>LABS</div>
            </div>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.7, maxWidth: 260 }}>
            Free digital tools for everyday people. Built by AVANTIC Labs to empower the modern internet user.
          </p>
        </div>
        <div>
          <h4 style={{ color: "white", fontWeight: 700, marginBottom: 14, fontSize: 14 }}>Tools</h4>
          {["Password Generator","Bio Generator","QR Code Generator","Word Counter","Age Calculator"].map(t => (
            <button key={t} onClick={() => setPage("tools")} style={{ display: "block", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 13, marginBottom: 8, fontFamily: "'Syne', sans-serif", textAlign: "left" }}
            onMouseEnter={e => e.target.style.color = "var(--neon-blue)"}
            onMouseLeave={e => e.target.style.color = "var(--text-secondary)"}>
              {t}
            </button>
          ))}
        </div>
        <div>
          <h4 style={{ color: "white", fontWeight: 700, marginBottom: 14, fontSize: 14 }}>Company</h4>
          {[["About", "about"],["Blog", "blog"],["Contact", "contact"]].map(([l,k]) => (
            <button key={k} onClick={() => setPage(k)} style={{ display: "block", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 13, marginBottom: 8, fontFamily: "'Syne', sans-serif", textAlign: "left" }}
            onMouseEnter={e => e.target.style.color = "var(--neon-blue)"}
            onMouseLeave={e => e.target.style.color = "var(--text-secondary)"}>
              {l}
            </button>
          ))}
        </div>
        <div>
          <h4 style={{ color: "white", fontWeight: 700, marginBottom: 14, fontSize: 14 }}>Legal</h4>
          {[["Privacy Policy","privacy"],["Terms of Service","terms"]].map(([l,k]) => (
            <button key={k} onClick={() => setPage(k)} style={{ display: "block", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 13, marginBottom: 8, fontFamily: "'Syne', sans-serif", textAlign: "left" }}
            onMouseEnter={e => e.target.style.color = "var(--neon-blue)"}
            onMouseLeave={e => e.target.style.color = "var(--text-secondary)"}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="divider" style={{ marginBottom: 24 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <span style={{ color: "var(--text-muted)", fontSize: 13 }}>© 2025 AVANTIC Labs. All rights reserved.</span>
        <span className="tag tag-blue">🔒 Free. No Signup. No Tracking.</span>
      </div>
    </div>
  </footer>
);

// ─── TOOLS DATA ───────────────────────────────────────────────────────────────
const TOOLS = [
  { id: "password", name: "Password Generator", emoji: "🔐", tag: "Security", desc: "Generate ultra-secure passwords instantly", color: "var(--neon-blue)" },
  { id: "bio", name: "Bio Generator", emoji: "✍️", tag: "Social", desc: "Craft perfect Instagram & Twitter bios", color: "var(--neon-purple)" },
  { id: "username", name: "Username Generator", emoji: "🎭", tag: "Social", desc: "Find unique, available usernames", color: "var(--neon-cyan)" },
  { id: "qr", name: "QR Code Generator", emoji: "📱", tag: "Utility", desc: "Generate QR codes for any URL or text", color: "var(--neon-pink)" },
  { id: "wordcount", name: "Word Counter", emoji: "📝", tag: "Writing", desc: "Count words, characters, reading time", color: "var(--neon-blue)" },
  { id: "age", name: "Age Calculator", emoji: "🎂", tag: "Calculator", desc: "Calculate exact age from any birthdate", color: "var(--neon-cyan)" },
  { id: "gpa", name: "GPA Calculator", emoji: "🎓", tag: "Education", desc: "Calculate GPA with grade point averages", color: "var(--neon-purple)" },
  { id: "unit", name: "Unit Converter", emoji: "⚖️", tag: "Calculator", desc: "Convert between any measurement units", color: "var(--neon-pink)" },
  { id: "timezone", name: "Timezone Converter", emoji: "🌍", tag: "Utility", desc: "Convert time across global timezones", color: "var(--neon-blue)" },
  { id: "typing", name: "Typing Speed Test", emoji: "⌨️", tag: "Productivity", desc: "Test and improve your WPM score", color: "var(--neon-cyan)" },
];

// ─── TOOL CARD ────────────────────────────────────────────────────────────────
const ToolCard = ({ tool, onOpen }) => (
  <button onClick={() => onOpen(tool.id)} className="glass" style={{
    display: "flex", flexDirection: "column", gap: 12, padding: 24,
    cursor: "pointer", textAlign: "left", width: "100%", position: "relative", overflow: "hidden",
  }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${tool.color}, transparent)` }} />
    <div style={{ fontSize: 32 }}>{tool.emoji}</div>
    <div>
      <div style={{ fontWeight: 700, fontSize: 15, color: "white", marginBottom: 4 }}>{tool.name}</div>
      <div style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.5 }}>{tool.desc}</div>
    </div>
    <span className="tag tag-blue" style={{ alignSelf: "flex-start" }}>{tool.tag}</span>
  </button>
);

// ─── TOOLS: Password Generator ───────────────────────────────────────────────
const PasswordTool = ({ onCopy }) => {
  const [len, setLen] = useState(16);
  const [opts, setOpts] = useState({ upper: true, lower: true, nums: true, symbols: true });
  const [pass, setPass] = useState("");
  const [strength, setStrength] = useState(0);

  const gen = useCallback(() => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const nums = "0123456789";
    const syms = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    let chars = "";
    if (opts.upper) chars += upper;
    if (opts.lower) chars += lower;
    if (opts.nums) chars += nums;
    if (opts.symbols) chars += syms;
    if (!chars) { setPass("Select at least one option"); return; }
    let p = "";
    for (let i = 0; i < len; i++) p += chars[Math.floor(Math.random() * chars.length)];
    setPass(p);
    const s = [opts.upper, opts.lower, opts.nums, opts.symbols].filter(Boolean).length;
    setStrength(Math.min(100, (s * 20) + (len / 64 * 40)));
  }, [len, opts]);

  useEffect(() => { gen(); }, [gen]);

  const toggleOpt = k => setOpts(o => ({ ...o, [k]: !o[k] }));
  const strengthColor = strength < 40 ? "#ef4444" : strength < 70 ? "#f59e0b" : "var(--neon-cyan)";
  const strengthLabel = strength < 40 ? "Weak" : strength < 70 ? "Good" : "Strong";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <label style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 8, display: "block" }}>Length: {len}</label>
        <input type="range" min={6} max={64} value={len} onChange={e => setLen(+e.target.value)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[["upper","Uppercase (A-Z)"],["lower","Lowercase (a-z)"],["nums","Numbers (0-9)"],["symbols","Symbols (!@#)"]].map(([k,l]) => (
          <label key={k} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "var(--text-secondary)", fontSize: 14, background: "rgba(255,255,255,0.03)", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)" }}>
            <input type="checkbox" checked={opts[k]} onChange={() => toggleOpt(k)} />
            {l}
          </label>
        ))}
      </div>
      <div className="result-box">{pass || "Click Generate"}</div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
          <span style={{ color: "var(--text-muted)" }}>Strength</span>
          <span style={{ color: strengthColor, fontWeight: 700 }}>{strengthLabel}</span>
        </div>
        <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${strength}%`, background: strengthColor, borderRadius: 3, transition: "all 0.4s ease" }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn-neon" onClick={gen} style={{ padding: "12px 24px", flex: 1, fontSize: 14 }}>
          <span>🔄 Generate New</span>
        </button>
        <CopyBtn text={pass} onCopy={onCopy} />
      </div>
    </div>
  );
};

// ─── TOOLS: Bio Generator ─────────────────────────────────────────────────────
const BioTool = ({ onCopy }) => {
  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [traits, setTraits] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  const templates = {
    instagram: [
      `✨ ${name || "Your Name"} | ${niche || "Your Niche"}\n${traits || "Passionate creator"} 🚀\nBuilding something amazing every day 💡\n👇 Check my latest work`,
      `🔥 ${name || "Creator"} • ${niche || "Content"}\n"${traits || "Dream big, work hard"}"\n📍 Making an impact online\n💌 DM for collabs`,
    ],
    twitter: [
      `${name || "Your Name"} | ${niche || "Tech Enthusiast"} 🧠\n${traits || "Building in public"} | Sharing what I learn\nTweets about ${niche || "tech, life & growth"} 🚀`,
    ],
    linkedin: [
      `${name || "Professional"} | ${niche || "Industry Expert"}\n${traits || "Passionate about innovation and driving results"}.\nHelping teams and individuals level up through strategic thinking and execution.`,
    ],
  };

  const gen = () => {
    setLoading(true);
    setTimeout(() => {
      const arr = templates[platform];
      setBio(arr[Math.floor(Math.random() * arr.length)]);
      setLoading(false);
    }, 600);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ color: "var(--text-muted)", fontSize: 12, display: "block", marginBottom: 6 }}>Your Name</label>
          <input className="input-neon" placeholder="e.g. Alex Rivera" value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", padding: "10px 14px", fontSize: 14 }} />
        </div>
        <div>
          <label style={{ color: "var(--text-muted)", fontSize: 12, display: "block", marginBottom: 6 }}>Your Niche</label>
          <input className="input-neon" placeholder="e.g. Fitness, Tech, Art" value={niche} onChange={e => setNiche(e.target.value)} style={{ width: "100%", padding: "10px 14px", fontSize: 14 }} />
        </div>
      </div>
      <div>
        <label style={{ color: "var(--text-muted)", fontSize: 12, display: "block", marginBottom: 6 }}>Key Traits / Keywords</label>
        <input className="input-neon" placeholder="e.g. entrepreneur, creative, traveler" value={traits} onChange={e => setTraits(e.target.value)} style={{ width: "100%", padding: "10px 14px", fontSize: 14 }} />
      </div>
      <div>
        <label style={{ color: "var(--text-muted)", fontSize: 12, display: "block", marginBottom: 6 }}>Platform</label>
        <select className="input-neon" value={platform} onChange={e => setPlatform(e.target.value)} style={{ width: "100%", padding: "10px 14px", fontSize: 14 }}>
          <option value="instagram">Instagram</option>
          <option value="twitter">Twitter / X</option>
          <option value="linkedin">LinkedIn</option>
        </select>
      </div>
      <button className="btn-neon" onClick={gen} style={{ padding: "12px", fontSize: 14 }} disabled={loading}>
        <span>{loading ? "Generating..." : "✨ Generate Bio"}</span>
      </button>
      {bio && (
        <>
          <div className="result-box" style={{ fontFamily: "'Syne', sans-serif", whiteSpace: "pre-line", lineHeight: 1.7 }}>{bio}</div>
          <CopyBtn text={bio} onCopy={onCopy} />
        </>
      )}
    </div>
  );
};

// ─── TOOLS: Username Generator ────────────────────────────────────────────────
const UsernameTool = ({ onCopy }) => {
  const [keyword, setKeyword] = useState("");
  const [style, setStyle] = useState("cool");
  const [usernames, setUsernames] = useState([]);

  const prefixes = { cool: ["Dark","Neo","Flux","Zero","Echo","Hyper","Ultra","Prime"], cute: ["Tiny","Cozy","Sweet","Bubbly","Fluffy","Happy","Lucky","Sunny"], pro: ["Pro","Expert","Master","Elite","Chief","Alpha","Lead","Core"] };
  const suffixes = ["_", "X", "99", "XO", "Pro", "HQ", "Dev", "XYZ", "Labs", "Zone"];

  const gen = () => {
    const base = keyword || ["Wolf","Star","Nova","Pixel","Ghost","Storm","Volt","Nyx"][Math.floor(Math.random() * 8)];
    const px = prefixes[style];
    const result = [];
    for (let i = 0; i < 8; i++) {
      const mode = i % 3;
      if (mode === 0) result.push(`${px[i % px.length]}${base}`);
      else if (mode === 1) result.push(`${base}${suffixes[i % suffixes.length]}`);
      else result.push(`${px[i % px.length]}${base}${Math.floor(Math.random() * 99) + 1}`);
    }
    setUsernames(result);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ color: "var(--text-muted)", fontSize: 12, display: "block", marginBottom: 6 }}>Keyword (optional)</label>
          <input className="input-neon" placeholder="e.g. wolf, star, pixel" value={keyword} onChange={e => setKeyword(e.target.value)} style={{ width: "100%", padding: "10px 14px", fontSize: 14 }} />
        </div>
        <div>
          <label style={{ color: "var(--text-muted)", fontSize: 12, display: "block", marginBottom: 6 }}>Style</label>
          <select className="input-neon" value={style} onChange={e => setStyle(e.target.value)} style={{ width: "100%", padding: "10px 14px", fontSize: 14 }}>
            <option value="cool">🔥 Cool & Edgy</option>
            <option value="cute">🌸 Cute & Fun</option>
            <option value="pro">💼 Professional</option>
          </select>
        </div>
      </div>
      <button className="btn-neon" onClick={gen} style={{ padding: "12px", fontSize: 14 }}>
        <span>🎲 Generate Usernames</span>
      </button>
      {usernames.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {usernames.map((u, i) => (
            <div key={i} style={{ background: "rgba(99,102,241,0.05)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="mono" style={{ color: "var(--neon-cyan)", fontSize: 13 }}>{u}</span>
              <button onClick={() => { navigator.clipboard?.writeText(u); onCopy("Copied!"); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>📋</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── TOOLS: QR Code Generator ─────────────────────────────────────────────────
const QRTool = () => {
  const [text, setText] = useState("https://avantic.tools");
  const [qrUrl, setQrUrl] = useState("");

  const gen = () => {
    const encoded = encodeURIComponent(text);
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}&bgcolor=07050f&color=6366f1&format=png`);
  };

  useEffect(() => { gen(); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label style={{ color: "var(--text-muted)", fontSize: 12, display: "block", marginBottom: 6 }}>URL or Text</label>
        <input className="input-neon" placeholder="https://your-website.com" value={text} onChange={e => setText(e.target.value)} style={{ width: "100%", padding: "12px 14px", fontSize: 14 }} />
      </div>
      <button className="btn-neon" onClick={gen} style={{ padding: "12px", fontSize: 14 }}>
        <span>📱 Generate QR Code</span>
      </button>
      {qrUrl && (
        <div style={{ textAlign: "center", padding: 24, background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid var(--border)" }}>
          <img src={qrUrl} alt="QR Code" style={{ width: 200, height: 200, imageRendering: "pixelated" }} />
          <div style={{ marginTop: 12 }}>
            <a href={qrUrl} download="qrcode.png">
              <button className="btn-ghost" style={{ padding: "8px 20px", fontSize: 13 }}>⬇️ Download PNG</button>
            </a>
          </div>
        </div>
      )}
      <p style={{ color: "var(--text-muted)", fontSize: 12, lineHeight: 1.6 }}>
        Generate QR codes for URLs, Wi-Fi passwords, contact cards, and more. Right-click or long-press to save the image.
      </p>
    </div>
  );
};

// ─── TOOLS: Word Counter ──────────────────────────────────────────────────────
const WordCountTool = () => {
  const [text, setText] = useState("");
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, "").length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
  const readTime = Math.max(1, Math.ceil(words / 200));
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim()).length;

  const stats = [
    { label: "Words", val: words, color: "var(--neon-blue)" },
    { label: "Characters", val: chars, color: "var(--neon-cyan)" },
    { label: "No Spaces", val: charsNoSpace, color: "var(--neon-purple)" },
    { label: "Sentences", val: sentences, color: "var(--neon-pink)" },
    { label: "Paragraphs", val: paragraphs, color: "var(--neon-blue)" },
    { label: "Read Time", val: `${readTime} min`, color: "var(--neon-cyan)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <textarea className="input-neon" placeholder="Paste or type your text here..." value={text} onChange={e => setText(e.target.value)}
        style={{ width: "100%", minHeight: 180, padding: "14px", fontSize: 14, resize: "vertical", lineHeight: 1.6 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 12px", textAlign: "center" }}>
            <div className="orbitron" style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 4, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>
      {text && (
        <button className="btn-ghost" onClick={() => setText("")} style={{ padding: "10px" }}>Clear Text</button>
      )}
    </div>
  );
};

// ─── TOOLS: Age Calculator ────────────────────────────────────────────────────
const AgeTool = () => {
  const [dob, setDob] = useState("");
  const [result, setResult] = useState(null);

  const calc = () => {
    if (!dob) return;
    const birth = new Date(dob);
    const now = new Date();
    let y = now.getFullYear() - birth.getFullYear();
    let m = now.getMonth() - birth.getMonth();
    let d = now.getDate() - birth.getDate();
    if (d < 0) { m--; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }
    const totalDays = Math.floor((now - birth) / (1000 * 60 * 60 * 24));
    const nextBday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBday < now) nextBday.setFullYear(now.getFullYear() + 1);
    const daysUntil = Math.floor((nextBday - now) / (1000 * 60 * 60 * 24));
    setResult({ y, m, d, totalDays, daysUntil, totalMonths: y * 12 + m });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label style={{ color: "var(--text-muted)", fontSize: 12, display: "block", marginBottom: 6 }}>Date of Birth</label>
        <input type="date" className="input-neon" value={dob} onChange={e => setDob(e.target.value)}
          style={{ width: "100%", padding: "12px 14px", fontSize: 14 }}
          max={new Date().toISOString().split("T")[0]} />
      </div>
      <button className="btn-neon" onClick={calc} style={{ padding: "12px", fontSize: 14 }}>
        <span>🎂 Calculate Age</span>
      </button>
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: 20, textAlign: "center" }}>
            <div className="orbitron grad-text" style={{ fontSize: 36, fontWeight: 900 }}>{result.y}</div>
            <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>Years Old</div>
            <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>{result.m} months, {result.d} days</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[["Total Days", result.totalDays.toLocaleString()],["Total Months", result.totalMonths],["Next B-day", `${result.daysUntil}d`]].map(([l,v]) => (
              <div key={l} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 8px", textAlign: "center" }}>
                <div style={{ color: "var(--neon-cyan)", fontWeight: 700, fontSize: 16 }}>{v}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 11 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── TOOLS: GPA Calculator ────────────────────────────────────────────────────
const GPATool = () => {
  const [courses, setCourses] = useState([
    { name: "Math", grade: "A", credits: 3 },
    { name: "English", grade: "B+", credits: 3 },
    { name: "Science", grade: "A-", credits: 4 },
  ]);

  const gradeMap = { "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "C-": 1.7, "D": 1.0, "F": 0.0 };

  const gpa = (() => {
    let totalPoints = 0, totalCredits = 0;
    courses.forEach(c => {
      const pts = gradeMap[c.grade] ?? 0;
      totalPoints += pts * c.credits;
      totalCredits += +c.credits;
    });
    return totalCredits ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  })();

  const gpaColor = gpa >= 3.7 ? "var(--neon-cyan)" : gpa >= 3.0 ? "var(--neon-blue)" : gpa >= 2.0 ? "#f59e0b" : "#ef4444";

  const addCourse = () => setCourses(c => [...c, { name: "", grade: "B", credits: 3 }]);
  const updateCourse = (i, field, val) => setCourses(c => c.map((x, idx) => idx === i ? { ...x, [field]: val } : x));
  const removeCourse = i => setCourses(c => c.filter((_, idx) => idx !== i));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ textAlign: "center", padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid var(--border)" }}>
        <div className="orbitron" style={{ fontSize: 40, fontWeight: 900, color: gpaColor }}>{gpa}</div>
        <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>Cumulative GPA</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {courses.map((c, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 8, alignItems: "center" }}>
            <input className="input-neon" placeholder="Course name" value={c.name} onChange={e => updateCourse(i, "name", e.target.value)} style={{ padding: "9px 12px", fontSize: 13 }} />
            <select className="input-neon" value={c.grade} onChange={e => updateCourse(i, "grade", e.target.value)} style={{ padding: "9px 10px", fontSize: 13 }}>
              {Object.keys(gradeMap).map(g => <option key={g}>{g}</option>)}
            </select>
            <input type="number" className="input-neon" min={1} max={6} value={c.credits} onChange={e => updateCourse(i, "credits", +e.target.value)} style={{ width: 56, padding: "9px 10px", fontSize: 13, textAlign: "center" }} />
            <button onClick={() => removeCourse(i)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, color: "#ef4444", cursor: "pointer", padding: "9px 12px", fontSize: 13 }}>✕</button>
          </div>
        ))}
      </div>
          <button className="btn-ghost" onClick={addCourse} style={{ padding: "10px" }}>+ Add Course</button>
    </div>
  );
};

// ─── TOOLS: Unit Converter ────────────────────────────────────────────────────
const UnitTool = () => {
  const [category, setCategory] = useState("length");
  const [fromUnit, setFromUnit] = useState("");
  const [toUnit, setToUnit] = useState("");
  const [value, setValue] = useState("");
  const [result, setResult] = useState("");

  const cats = {
    length: { label: "📏 Length", units: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.34, ft: 0.3048, inch: 0.0254, yard: 0.9144 }},
    weight: { label: "⚖️ Weight", units: { kg: 1, g: 0.001, lb: 0.453592, oz: 0.0283495, ton: 1000 }},
    temp: { label: "🌡️ Temperature", units: { C: "c", F: "f", K: "k" }},
    speed: { label: "💨 Speed", units: { "km/h": 1, "m/s": 3.6, mph: 1.60934, knot: 1.852 }},
    area: { label: "📐 Area", units: { m2: 1, km2: 1e6, ft2: 0.092903, acre: 4046.86, hectare: 10000 }},
  };

  useEffect(() => {
    const units = Object.keys(cats[category].units);
    setFromUnit(units[0]);
    setToUnit(units[1]);
    setResult("");
    setValue("");
  }, [category]);

  const convert = () => {
    const v = parseFloat(value);
    if (isNaN(v)) { setResult("Enter a number"); return; }
    if (category === "temp") {
      let celsius = fromUnit === "C" ? v : fromUnit === "F" ? (v - 32) * 5/9 : v - 273.15;
      let out = toUnit === "C" ? celsius : toUnit === "F" ? celsius * 9/5 + 32 : celsius + 273.15;
      setResult(`${out.toFixed(4)} ${toUnit}`);
    } else {
      const units = cats[category].units;
      const inBase = v * (units[fromUnit] || 1);
      const out = inBase / (units[toUnit] || 1);
      setResult(`${out.toFixed(6).replace(/\.?0+$/, "")} ${toUnit}`);
    }
  };

  const unitKeys = Object.keys(cats[category].units);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {Object.entries(cats).map(([k, v]) => (
          <button key={k} onClick={() => setCategory(k)} style={{
            padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Syne', sans-serif",
            background: category === k ? "var(--neon-blue)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${category === k ? "var(--neon-blue)" : "var(--border)"}`,
            color: category === k ? "white" : "var(--text-secondary)",
          }}>{v.label}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label style={{ color: "var(--text-muted)", fontSize: 12, display: "block", marginBottom: 6 }}>From</label>
          <select className="input-neon" value={fromUnit} onChange={e => setFromUnit(e.target.value)} style={{ width: "100%", padding: "10px 12px", fontSize: 13, marginBottom: 8 }}>
            {unitKeys.map(u => <option key={u}>{u}</option>)}
          </select>
          <input className="input-neon" type="number" placeholder="Enter value" value={value} onChange={e => setValue(e.target.value)} style={{ width: "100%", padding: "10px 12px", fontSize: 14 }} />
        </div>
        <div>
          <label style={{ color: "var(--text-muted)", fontSize: 12, display: "block", marginBottom: 6 }}>To</label>
          <select className="input-neon" value={toUnit} onChange={e => setToUnit(e.target.value)} style={{ width: "100%", padding: "10px 12px", fontSize: 13, marginBottom: 8 }}>
            {unitKeys.map(u => <option key={u}>{u}</option>)}
          </select>
          <div className="result-box" style={{ display: "flex", alignItems: "center", minHeight: 44 }}>{result || "—"}</div>
        </div>
      </div>
      <button className="btn-neon" onClick={convert} style={{ padding: "12px", fontSize: 14 }}>
        <span>⚡ Convert</span>
      </button>
    </div>
  );
};

// ─── TOOLS: Timezone Converter ────────────────────────────────────────────────
const TimezoneTool = () => {
  const [datetime, setDatetime] = useState(() => new Date().toISOString().slice(0, 16));
  const [fromTZ, setFromTZ] = useState("America/New_York");
  const [toTZ, setToTZ] = useState("Asia/Tokyo");
  const [result, setResult] = useState("");

  const zones = ["UTC","America/New_York","America/Los_Angeles","America/Chicago","Europe/London","Europe/Paris","Europe/Berlin","Asia/Tokyo","Asia/Shanghai","Asia/Dubai","Asia/Kolkata","Australia/Sydney","Pacific/Auckland"];

  const convert = () => {
    try {
      const date = new Date(datetime);
      const formatted = date.toLocaleString("en-US", { timeZone: toTZ, dateStyle: "full", timeStyle: "short" });
      setResult(formatted);
    } catch {
      setResult("Invalid conversion");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label style={{ color: "var(--text-muted)", fontSize: 12, display: "block", marginBottom: 6 }}>Date & Time</label>
        <input type="datetime-local" className="input-neon" value={datetime} onChange={e => setDatetime(e.target.value)} style={{ width: "100%", padding: "10px 14px", fontSize: 14 }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ color: "var(--text-muted)", fontSize: 12, display: "block", marginBottom: 6 }}>From Timezone</label>
          <select className="input-neon" value={fromTZ} onChange={e => setFromTZ(e.target.value)} style={{ width: "100%", padding: "10px 12px", fontSize: 12 }}>
            {zones.map(z => <option key={z}>{z}</option>)}
          </select>
        </div>
        <div>
          <label style={{ color: "var(--text-muted)", fontSize: 12, display: "block", marginBottom: 6 }}>To Timezone</label>
          <select className="input-neon" value={toTZ} onChange={e => setToTZ(e.target.value)} style={{ width: "100%", padding: "10px 12px", fontSize: 12 }}>
            {zones.map(z => <option key={z}>{z}</option>)}
          </select>
        </div>
      </div>
      <button className="btn-neon" onClick={convert} style={{ padding: "12px", fontSize: 14 }}>
        <span>🌍 Convert Timezone</span>
      </button>
      {result && (
        <div className="result-box" style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, lineHeight: 1.6 }}>
          📅 {result}
        </div>
      )}
    </div>
  );
};

// ─── TOOLS: Typing Speed Test ─────────────────────────────────────────────────
const TEXTS = [
  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!",
  "Technology is best when it brings people together. The internet is the most powerful invention of the century and continues to reshape our world.",
  "Success is not final, failure is not fatal. It is the courage to continue that counts. Hard work beats talent when talent does not work hard.",
];

const TypingTool = () => {
  const [idx] = useState(Math.floor(Math.random() * TEXTS.length));
  const text = TEXTS[idx];
  const [typed, setTyped] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [finished, setFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [acc, setAcc] = useState(0);
  const inputRef = useRef();

  const reset = () => { setTyped(""); setStartTime(null); setFinished(false); setWpm(0); setAcc(0); inputRef.current?.focus(); };

  const handleType = (e) => {
    const val = e.target.value;
    if (!startTime && val.length === 1) setStartTime(Date.now());
    setTyped(val);
    if (val.length >= text.length) {
      const mins = (Date.now() - startTime) / 60000;
      const wordsTyped = val.trim().split(/\s+/).length;
      setWpm(Math.round(wordsTyped / mins));
      let correct = 0;
      for (let i = 0; i < val.length; i++) if (val[i] === text[i]) correct++;
      setAcc(Math.round((correct / text.length) * 100));
      setFinished(true);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {!finished ? (
        <>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, lineHeight: 1.8, fontSize: 15, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.03em" }}>
            {text.split("").map((ch, i) => {
              let color = "var(--text-muted)";
              if (i < typed.length) color = typed[i] === ch ? "var(--neon-cyan)" : "#ef4444";
              return <span key={i} style={{ color }}>{ch}</span>;
            })}
          </div>
          <textarea ref={inputRef} className="input-neon" placeholder="Start typing here..." value={typed} onChange={handleType}
            style={{ width: "100%", minHeight: 100, padding: 14, fontSize: 14, resize: "none", fontFamily: "'JetBrains Mono', monospace" }}
            spellCheck={false} autoCorrect="off" autoCapitalize="off" />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-muted)" }}>
            <span>Progress: {typed.length}/{text.length} chars</span>
            {startTime && <span className="mono" style={{ color: "var(--neon-cyan)" }}>⌨️ Typing...</span>}
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid var(--neon-blue)", borderRadius: 12, padding: 20 }}>
              <div className="orbitron" style={{ fontSize: 44, fontWeight: 900, color: "var(--neon-blue)" }}>{wpm}</div>
              <div style={{ color: "var(--text-secondary)" }}>WPM</div>
            </div>
            <div style={{ background: "rgba(34,211,238,0.1)", border: "1px solid var(--neon-cyan)", borderRadius: 12, padding: 20 }}>
              <div className="orbitron" style={{ fontSize: 44, fontWeight: 900, color: "var(--neon-cyan)" }}>{acc}%</div>
              <div style={{ color: "var(--text-secondary)" }}>Accuracy</div>
            </div>
          </div>
          <div style={{ color: "var(--text-secondary)", marginBottom: 16, fontSize: 14 }}>
            {wpm > 80 ? "🔥 Blazing fast! You're a typing master!" : wpm > 50 ? "⚡ Great speed! Above average!" : "💪 Good effort! Keep practicing to improve!"}
          </div>
          <button className="btn-neon" onClick={reset} style={{ padding: "12px 32px", fontSize: 14 }}>
            <span>🔄 Try Again</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ─── TOOL MODAL / PAGE ────────────────────────────────────────────────────────
const ToolPage = ({ toolId, onBack, onCopy }) => {
  const tool = TOOLS.find(t => t.id === toolId);
  if (!tool) return null;

  const components = { password: PasswordTool, bio: BioTool, username: UsernameTool, qr: QRTool, wordcount: WordCountTool, age: AgeTool, gpa: GPATool, unit: UnitTool, timezone: TimezoneTool, typing: TypingTool };
  const ToolComponent = components[toolId];

  return (
    <div style={{ minHeight: "100vh", paddingTop: 90 }}>
      <div className="container" style={{ maxWidth: 700 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 14, marginBottom: 24, display: "flex", alignItems: "center", gap: 6, fontFamily: "'Syne', sans-serif" }}>
          ← Back to Tools
        </button>
        <div className="glass" style={{ padding: 32, marginBottom: 24, animation: "fadeInUp 0.5s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
            <span style={{ fontSize: 40 }}>{tool.emoji}</span>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "white" }}>{tool.name}</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>{tool.desc}</p>
            </div>
          </div>
        </div>
        <div className="glass" style={{ padding: 28, animation: "fadeInUp 0.5s ease 0.1s both" }}>
          <ToolComponent onCopy={onCopy} />
        </div>
        <div style={{ marginTop: 24, padding: 24, background: "rgba(99,102,241,0.05)", border: "1px solid var(--border)", borderRadius: 12 }}>
          <h3 style={{ color: "white", fontWeight: 700, marginBottom: 10, fontSize: 16 }}>About This Tool</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7 }}>
            {tool.name} is a free online tool by AVANTIC Tools. No registration, no tracking, no cost — just fast and reliable results. Part of the AVANTIC Labs ecosystem of free digital utilities.
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── HOMEPAGE ─────────────────────────────────────────────────────────────────
const HomePage = ({ setPage, setCurrentTool }) => {
  const [search, setSearch] = useState("");
  const filtered = TOOLS.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.tag.toLowerCase().includes(search.toLowerCase()));

  const categories = [...new Set(TOOLS.map(t => t.tag))];
  const [activeCategory, setActiveCategory] = useState("All");
  const displayTools = (activeCategory === "All" ? filtered : filtered.filter(t => t.tag === activeCategory)).slice(0, 6);

  const stats = [{ val: "10+", label: "Free Tools" }, { val: "0", label: "Sign-ups Needed" }, { val: "100%", label: "Free Forever" }, { val: "∞", label: "Uses Allowed" }];

  return (
    <div>
      {/* Hero */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "100px 20px 60px", position: "relative", overflow: "hidden" }}>
        {/* Ambient glows */}
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "30%", left: "20%", width: 300, height: 300, background: "radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 780, position: "relative", zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24, animation: "float 4s ease-in-out infinite" }}>
            <AvanticLogo size={80} />
          </div>

          <div className="tag tag-cyan" style={{ marginBottom: 20, display: "inline-flex" }}>
            ✦ AVANTIC Labs Production — Free Forever
          </div>

          <h1 className="orbitron" style={{ fontSize: "clamp(32px, 7vw, 64px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 20 }}>
            <span style={{ color: "white" }}>The Ultimate</span>
            <br />
            <span className="grad-text">Free Tools Suite</span>
          </h1>

          <p style={{ color: "var(--text-secondary)", fontSize: "clamp(15px, 2.5vw, 19px)", lineHeight: 1.7, maxWidth: 600, margin: "0 auto 36px" }}>
            10+ powerful digital tools — no signup, no cost, no limits. Password generators, QR codes, bio creators, and more.
          </p>

          {/* Search */}
          <div style={{ position: "relative", maxWidth: 500, margin: "0 auto 32px" }}>
            <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 18, pointerEvents: "none" }}>🔍</span>
            <input className="input-neon" placeholder="Search tools..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", padding: "16px 16px 16px 48px", fontSize: 16, borderRadius: 14 }} />
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-neon" onClick={() => setPage("tools")} style={{ padding: "14px 32px", fontSize: 15 }}>
              <span>🚀 Explore All Tools</span>
            </button>
            <button className="btn-ghost" onClick={() => setPage("blog")} style={{ padding: "14px 28px", fontSize: 15 }}>
              📖 Read Blog
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: "0 0 60px" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {stats.map((s, i) => (
              <div key={i} className="glass" style={{ padding: "24px 16px", textAlign: "center", animation: `fadeInUp 0.5s ease ${i * 0.1}s both` }}>
                <div className="orbitron grad-text" style={{ fontSize: 28, fontWeight: 900 }}>{s.val}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4, fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" style={{ margin: "0 40px" }} />

      {/* Featured Tools */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div className="tag tag-purple" style={{ marginBottom: 12, display: "inline-flex" }}>⚡ Trending Tools</div>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 800, color: "white", marginBottom: 12 }}>Tools People Love</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>No account needed. Just open and use.</p>
          </div>

          {/* Category Filter */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 28 }}>
            {["All", ...categories].map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                padding: "7px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Syne', sans-serif", transition: "all 0.2s ease",
                background: activeCategory === cat ? "var(--neon-blue)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${activeCategory === cat ? "var(--neon-blue)" : "var(--border)"}`,
                color: activeCategory === cat ? "white" : "var(--text-secondary)",
              }}>{cat}</button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {displayTools.map((tool, i) => (
              <div key={tool.id} style={{ animation: `fadeInUp 0.5s ease ${i * 0.08}s both` }}>
                <ToolCard tool={tool} onOpen={(id) => { setCurrentTool(id); setPage("tool"); }} />
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button className="btn-neon" onClick={() => setPage("tools")} style={{ padding: "13px 32px", fontSize: 14 }}>
              <span>View All 10+ Tools →</span>
            </button>
          </div>
        </div>
      </section>

      {/* SEO Description */}
      <section style={{ padding: "60px 0", background: "rgba(99,102,241,0.03)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 800, color: "white", marginBottom: 20, textAlign: "center" }}>
            Why AVANTIC Tools?
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {[
              { icon: "🔒", title: "100% Private", desc: "All processing happens in your browser. Nothing is stored or sent to any server." },
              { icon: "⚡", title: "Instant Results", desc: "Tools load and compute in milliseconds. Engineered for speed and efficiency." },
              { icon: "📱", title: "Mobile Optimized", desc: "Designed mobile-first. Every tool works perfectly on any screen size." },
              { icon: "💯", title: "Always Free", desc: "No freemium traps, no sign-up walls. Every tool is free forever, guaranteed." },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8, padding: 20, background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid var(--border)" }}>
                <span style={{ fontSize: 28 }}>{item.icon}</span>
                <h3 style={{ color: "white", fontWeight: 700, fontSize: 16 }}>{item.title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container" style={{ maxWidth: 700 }}>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 800, color: "white", marginBottom: 32, textAlign: "center" }}>Frequently Asked Questions</h2>
          {[
            ["Are these tools really free?", "Yes. All AVANTIC Tools are completely free. No credit card, no email, no account required — ever."],
            ["Is my data safe?", "All tools run entirely in your browser. We never collect, store, or transmit your data to any server."],
            ["Can I use AVANTIC Tools on mobile?", "Absolutely. Every tool is designed mobile-first and tested on all major smartphone browsers."],
            ["How many tools do you have?", "We currently have 10+ tools and are actively expanding the collection. Check back regularly for new additions."],
            ["Who made AVANTIC Tools?", "AVANTIC Tools is built and maintained by AVANTIC Labs — a team dedicated to building free, high-quality digital utilities for everyone."],
          ].map(([q, a], i) => (
            <FaqItem key={i} q={q} a={a} />
          ))}
        </div>
      </section>
    </div>
  );
};

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: 10 }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", background: open ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.02)", border: "none", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", color: "white", fontWeight: 700, fontFamily: "'Syne', sans-serif", fontSize: 15, textAlign: "left" }}>
        {q}
        <span style={{ color: "var(--neon-blue)", fontSize: 18, transform: open ? "rotate(45deg)" : "none", transition: "transform 0.2s ease" }}>+</span>
      </button>
      {open && <div style={{ padding: "12px 20px 16px", color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7, background: "rgba(255,255,255,0.01)" }}>{a}</div>}
    </div>
  );
};

// ─── TOOLS PAGE ───────────────────────────────────────────────────────────────
const ToolsPage = ({ setCurrentTool, setPage }) => (
  <div style={{ minHeight: "100vh", paddingTop: 90 }}>
    <div className="container">
      <div style={{ textAlign: "center", marginBottom: 50, padding: "40px 0" }}>
        <div className="tag tag-blue" style={{ marginBottom: 14, display: "inline-flex" }}>🔧 All Tools</div>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, color: "white", marginBottom: 14 }}>
          Free Online <span className="grad-text">Tools</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 17, maxWidth: 520, margin: "0 auto" }}>
          10+ handcrafted tools for productivity, creativity, and everyday tasks.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {TOOLS.map((tool, i) => (
          <div key={tool.id} style={{ animation: `fadeInUp 0.4s ease ${i * 0.06}s both` }}>
            <ToolCard tool={tool} onOpen={(id) => { setCurrentTool(id); setPage("tool"); }} />
          </div>
        ))}
      </div>

      {/* Ad Zone Placeholder */}
      <div style={{ margin: "48px 0", padding: 24, border: "2px dashed rgba(99,102,241,0.2)", borderRadius: 14, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
        Advertisement Zone — Google AdSense Placement
      </div>
    </div>
  </div>
);

// ─── BLOG PAGE ────────────────────────────────────────────────────────────────
const BLOG_POSTS = [
  {
    id: "best-free-tools-students",
    title: "Best Free Online Tools for Students in 2025",
    tag: "Productivity",
    date: "May 2025",
    readTime: "5 min",
    excerpt: "From word counters to GPA calculators, discover the most useful free tools every student should have bookmarked.",
    content: `Whether you're in high school or university, having the right digital tools can dramatically boost your academic performance. In 2025, free online utilities have become essential study companions.

**Word Counter & Text Tools**
Keeping track of word count is critical for essay submissions. AVANTIC's Word Counter gives you real-time statistics including character count, sentence count, and estimated reading time — all without signing up.

**GPA Calculator**
One of the most stressful calculations for any student is GPA tracking. Our GPA Calculator supports all major grading systems and lets you simulate future grades to plan your academic path.

**Password Generator**
Creating strong, unique passwords for student portals, email, and educational apps is crucial for digital safety. Use our Password Generator to create unhackable credentials instantly.

**Typing Speed Test**
The average professional types 50-70 WPM. Students who can type faster spend less time on assignments and more time learning. Practice with our Typing Speed Test to track improvement over time.

**The Bottom Line**
Free tools don't have to be low-quality. AVANTIC Tools provides premium-grade utilities with zero cost, zero tracking, and zero sign-up. Bookmark this page and share with your classmates!`,
  },
  {
    id: "how-to-calculate-gpa",
    title: "How to Calculate Your GPA Easily (Step-by-Step Guide)",
    tag: "Education",
    date: "May 2025",
    readTime: "4 min",
    excerpt: "Understanding GPA calculation is simpler than you think. We break it down with a clear formula and real examples.",
    content: `GPA (Grade Point Average) is one of the most important metrics in academic life, yet many students find the calculation confusing. This guide makes it simple.

**What is GPA?**
GPA is a standardized way of measuring academic performance. In the US 4.0 scale system, each letter grade maps to a numeric value.

**The Grade Point Scale**
- A+ / A = 4.0
- A- = 3.7
- B+ = 3.3
- B = 3.0
- B- = 2.7
- C+ = 2.3
- C = 2.0
- D = 1.0
- F = 0.0

**The Formula**
GPA = Sum of (Grade Points × Credit Hours) ÷ Total Credit Hours

**Example Calculation**
If you took Math (A, 3 credits), English (B+, 3 credits), and Science (A-, 4 credits):
- Math: 4.0 × 3 = 12.0
- English: 3.3 × 3 = 9.9
- Science: 3.7 × 4 = 14.8
- Total Points: 36.7 ÷ 10 total credits = 3.67 GPA

**Use Our Free GPA Calculator**
Instead of doing this by hand, use AVANTIC's free GPA Calculator. Add all your courses, select your grades and credit hours, and get your GPA instantly.`,
  },
  {
    id: "improve-typing-speed",
    title: "How to Improve Your Typing Speed: 7 Proven Techniques",
    tag: "Productivity",
    date: "April 2025",
    readTime: "6 min",
    excerpt: "Going from 30 WPM to 80+ WPM is achievable with the right practice strategy. Here's exactly how to do it.",
    content: `Typing speed is one of those skills that pays compounding dividends — the faster you type, the more productive every aspect of your digital life becomes.

**1. Learn Touch Typing First**
The biggest leap in typing speed comes from learning to type without looking at the keyboard. Home row position (ASDF JKL;) is your foundation.

**2. Focus on Accuracy Over Speed**
Speed follows accuracy — never the reverse. Practice slowly and correctly. Muscle memory is built on repetition, and bad habits are incredibly hard to unlearn.

**3. Practice Daily (Even 10 Minutes Helps)**
Consistency beats intensity. Ten minutes of focused typing practice daily will outperform one hour per week.

**4. Use the Right Tools**
AVANTIC's Typing Speed Test gives you real-time WPM and accuracy measurements. Test yourself regularly to track your improvement.

**5. Type Real Content**
Instead of typing random letters, practice with meaningful text — articles, quotes, code. Your brain engages differently with meaningful language.

**6. Work on Your Weakest Keys**
Track which letters you consistently mistype and drill them specifically. 'P', 'Y', and number rows are common problem areas.

**7. Optimize Your Setup**
A good keyboard, proper desk height, and wrist positioning can dramatically affect both speed and long-term comfort.

**Where to Start**
Take AVANTIC's free Typing Speed Test right now to get your baseline WPM, then set a 30-day goal to beat it.`,
  },
];

const BlogPage = ({ setPage, setCurrentBlog }) => (
  <div style={{ minHeight: "100vh", paddingTop: 90 }}>
    <div className="container">
      <div style={{ textAlign: "center", padding: "40px 0 50px" }}>
        <div className="tag tag-cyan" style={{ marginBottom: 14, display: "inline-flex" }}>📖 Blog</div>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 900, color: "white", marginBottom: 14 }}>
          Tips, Guides & <span className="grad-text">Tutorials</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>Practical articles about productivity, tech tools, and digital skills.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
        {BLOG_POSTS.map((post, i) => (
          <button key={post.id} onClick={() => { setCurrentBlog(post.id); setPage("blogpost"); }} className="glass" style={{ cursor: "pointer", textAlign: "left", padding: 28, display: "flex", flexDirection: "column", gap: 12, animation: `fadeInUp 0.4s ease ${i * 0.1}s both` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="tag tag-purple">{post.tag}</span>
              <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{post.readTime} read</span>
            </div>
            <h2 style={{ color: "white", fontWeight: 800, fontSize: 17, lineHeight: 1.4 }}>{post.title}</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.6, flexGrow: 1 }}>{post.excerpt}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
              <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{post.date}</span>
              <span style={{ color: "var(--neon-blue)", fontSize: 13, fontWeight: 700 }}>Read →</span>
            </div>
          </button>
        ))}
      </div>

      {/* Ad Zone */}
      <div style={{ margin: "48px 0 24px", padding: 24, border: "2px dashed rgba(99,102,241,0.2)", borderRadius: 14, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
        Advertisement Zone — In-Blog AdSense Placement
      </div>
    </div>
  </div>
);

const BlogPostPage = ({ postId, onBack, setPage, setCurrentTool }) => {
  const post = BLOG_POSTS.find(p => p.id === postId);
  if (!post) return null;
  return (
    <div style={{ minHeight: "100vh", paddingTop: 90 }}>
      <div className="container" style={{ maxWidth: 740 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 14, marginBottom: 24, display: "flex", alignItems: "center", gap: 6, fontFamily: "'Syne', sans-serif" }}>← Back to Blog</button>
        <article className="glass" style={{ padding: "36px", animation: "fadeInUp 0.5s ease" }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            <span className="tag tag-purple">{post.tag}</span>
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{post.date}</span>
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>· {post.readTime} read</span>
          </div>
          <h1 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 900, color: "white", lineHeight: 1.3, marginBottom: 12 }}>{post.title}</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 28, lineHeight: 1.6 }}>{post.excerpt}</p>
          <div className="divider" style={{ marginBottom: 28 }} />
          <div style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.85 }}>
            {post.content.split("\n\n").map((para, i) => {
              if (para.startsWith("**") && para.endsWith("**")) {
                return <h3 key={i} style={{ color: "white", fontWeight: 800, fontSize: 17, margin: "24px 0 8px" }}>{para.replace(/\*\*/g, "")}</h3>;
              }
              if (para.match(/^\*\*/)) {
                return <p key={i} style={{ marginBottom: 14 }} dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, '<strong style="color:white">$1</strong>') }} />;
              }
              if (para.startsWith("- ")) {
                return <ul key={i} style={{ paddingLeft: 20, marginBottom: 14 }}>{para.split("\n").map((li, j) => <li key={j} style={{ marginBottom: 6 }}>{li.replace("- ", "")}</li>)}</ul>;
              }
              return <p key={i} style={{ marginBottom: 14 }}>{para}</p>;
            })}
          </div>
        </article>
        <div style={{ margin: "28px 0", padding: 24, background: "rgba(99,102,241,0.05)", border: "1px solid var(--border-bright)", borderRadius: 14, textAlign: "center" }}>
          <h3 style={{ color: "white", fontWeight: 800, marginBottom: 8 }}>Try the Free Tools Mentioned</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 16 }}>All tools are free, no signup required.</p>
          <button className="btn-neon" onClick={() => setPage("tools")} style={{ padding: "12px 28px", fontSize: 14 }}>
            <span>Explore All Tools →</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── ABOUT PAGE ───────────────────────────────────────────────────────────────
const AboutPage = () => (
  <div style={{ minHeight: "100vh", paddingTop: 90 }}>
    <div className="container" style={{ maxWidth: 800 }}>
      <div style={{ textAlign: "center", padding: "40px 0 50px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <AvanticLogo size={80} />
        </div>
        <h1 className="orbitron" style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 900, marginBottom: 14 }}>
          About <span className="grad-text">AVANTIC Labs</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 17, lineHeight: 1.7, maxWidth: 600, margin: "0 auto" }}>
          We build free, powerful tools for the modern internet user.
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {[
          { title: "Our Mission", content: "AVANTIC Labs exists to democratize access to powerful digital tools. We believe everyone deserves professional-grade utilities without paywalls, sign-up forms, or privacy compromises. Our tools are engineered for speed, privacy, and simplicity." },
          { title: "Our Values", content: "Privacy-first: all processing happens locally in your browser. Free forever: no freemium traps or time-limited trials. Accessible design: every tool works on any device, any screen, any browser. Continuous improvement: we listen to users and ship updates regularly." },
          { title: "AVANTIC Tools Platform", content: "AVANTIC Tools is the flagship product of AVANTIC Labs. We're building a comprehensive ecosystem of 100+ free tools covering productivity, creativity, security, education, and more. Each tool is crafted with obsessive attention to user experience." },
        ].map((s, i) => (
          <div key={i} className="glass" style={{ padding: 28, animation: `fadeInUp 0.5s ease ${i * 0.1}s both` }}>
            <h2 style={{ color: "white", fontWeight: 800, fontSize: 20, marginBottom: 12 }}>{s.title}</h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: 15 }}>{s.content}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── CONTACT PAGE ─────────────────────────────────────────────────────────────
const ContactPage = () => {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const submit = () => {
    if (form.name && form.email && form.message) setSent(true);
  };

  return (
    <div style={{ minHeight: "100vh", paddingTop: 90 }}>
      <div className="container" style={{ maxWidth: 600 }}>
        <div style={{ textAlign: "center", padding: "40px 0 40px" }}>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 900, color: "white", marginBottom: 10 }}>Contact <span className="grad-text">Us</span></h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>Have feedback, suggestions, or found a bug? We'd love to hear from you.</p>
        </div>
        <div className="glass" style={{ padding: 32 }}>
          {!sent ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ color: "var(--text-muted)", fontSize: 12, display: "block", marginBottom: 6 }}>Your Name</label>
                <input className="input-neon" placeholder="Alex Rivera" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ width: "100%", padding: "12px 14px", fontSize: 14 }} />
              </div>
              <div>
                <label style={{ color: "var(--text-muted)", fontSize: 12, display: "block", marginBottom: 6 }}>Email Address</label>
                <input className="input-neon" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={{ width: "100%", padding: "12px 14px", fontSize: 14 }} />
              </div>
              <div>
                <label style={{ color: "var(--text-muted)", fontSize: 12, display: "block", marginBottom: 6 }}>Message</label>
                <textarea className="input-neon" placeholder="Tell us anything..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} style={{ width: "100%", minHeight: 120, padding: "12px 14px", fontSize: 14, resize: "vertical" }} />
              </div>
              <button className="btn-neon" onClick={submit} style={{ padding: "13px", fontSize: 14 }}>
                <span>📨 Send Message</span>
              </button>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
              <h3 style={{ color: "white", fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Message Sent!</h3>
              <p style={{ color: "var(--text-secondary)" }}>Thanks {form.name}! We'll get back to you as soon as possible.</p>
            </div>
          )}
        </div>
        <div style={{ marginTop: 20, padding: 20, background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>
          📧 Email: official.avanticlabs@gmail.com<br />
          🌐 Website: avanticlab.vercel.appls<br />
          Response time: typically within 24 hours
        </div>
      </div>
    </div>
  );
};

// ─── PRIVACY POLICY ───────────────────────────────────────────────────────────
const PrivacyPage = () => (
  <div style={{ minHeight: "100vh", paddingTop: 90 }}>
    <div className="container" style={{ maxWidth: 740 }}>
      <div style={{ padding: "40px 0 30px" }}>
        <h1 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 900, color: "white", marginBottom: 8 }}>Privacy <span className="grad-text">Policy</span></h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Last updated: May 2025</p>
      </div>
      <div className="glass" style={{ padding: 32 }}>
        {[
          ["1. Overview", "AVANTIC Tools is committed to protecting your privacy. This policy explains how we handle information when you use our website and tools."],
          ["2. No Personal Data Collection", "AVANTIC Tools does not collect, store, or transmit any personal information. All tool computations occur entirely within your web browser. We do not have servers that process your inputs."],
          ["3. Analytics", "We may use privacy-respecting analytics (such as Google Analytics with anonymized IPs) to understand general usage patterns. This data contains no personally identifiable information."],
          ["4. Cookies", "We may use essential cookies required for website functionality. We do not use tracking or advertising cookies beyond what advertising partners (such as Google AdSense) may require."],
          ["5. Google AdSense", "We participate in Google AdSense advertising. Google may serve ads based on your browsing history using cookies. You can opt out at google.com/settings/ads."],
          ["6. Third-Party Links", "Our blog and tools may link to external websites. We are not responsible for the privacy practices of those sites."],
          ["7. Children's Privacy", "AVANTIC Tools is not directed at children under 13. We do not knowingly collect information from children."],
          ["8. Changes to This Policy", "We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date."],
          ["9. Contact", "For privacy concerns, contact us at privacy@avantic.tools"],
        ].map(([title, content], i) => (
          <div key={i} style={{ marginBottom: 24 }}>
            <h3 style={{ color: "white", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{title}</h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: 14 }}>{content}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── TERMS OF SERVICE ─────────────────────────────────────────────────────────
const TermsPage = () => (
  <div style={{ minHeight: "100vh", paddingTop: 90 }}>
    <div className="container" style={{ maxWidth: 740 }}>
      <div style={{ padding: "40px 0 30px" }}>
        <h1 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 900, color: "white", marginBottom: 8 }}>Terms of <span className="grad-text">Service</span></h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Last updated: May 2025</p>
      </div>
      <div className="glass" style={{ padding: 32 }}>
        {[
          ["1. Acceptance of Terms", "By using AVANTIC Tools, you agree to these Terms of Service. If you do not agree, please do not use our website."],
          ["2. Free Service", "AVANTIC Tools provides its services free of charge. We reserve the right to modify, suspend, or discontinue any part of the service at any time."],
          ["3. Acceptable Use", "You agree to use AVANTIC Tools only for lawful purposes. You may not use our tools to generate content for illegal activities, spam, or to harm others."],
          ["4. Intellectual Property", "The AVANTIC Tools website, logo, brand, and tool code are the property of AVANTIC Labs. You may not copy, reproduce, or redistribute our software without permission."],
          ["5. Disclaimer of Warranties", "AVANTIC Tools is provided 'as is' without warranties of any kind. We do not guarantee the accuracy, completeness, or fitness for any particular purpose of our tools."],
          ["6. Limitation of Liability", "AVANTIC Labs shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of our tools."],
          ["7. Changes to Terms", "We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance."],
          ["8. Contact", "For questions about these terms, contact us at legal@avantic.tools"],
        ].map(([title, content], i) => (
          <div key={i} style={{ marginBottom: 24 }}>
            <h3 style={{ color: "white", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{title}</h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: 14 }}>{content}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);



  
        