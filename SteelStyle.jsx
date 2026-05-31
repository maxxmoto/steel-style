import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView, useMotionValue, useSpring } from "framer-motion";

// ─── FONTS via Google ───────────────────────────────────────────────────────
const FontLink = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { font-family: 'DM Sans', sans-serif; background: #f8f7f5; color: #1a1a1a; overflow-x: hidden; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #f0ede8; }
    ::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 2px; }
    .font-display { font-family: 'Cormorant Garamond', serif; }
    .font-heading { font-family: 'Syne', sans-serif; }
    .font-body { font-family: 'DM Sans', sans-serif; }
    .metal-gradient { background: linear-gradient(135deg, #e8e4df 0%, #f5f3f0 25%, #ddd9d4 50%, #f0ede8 75%, #e2ddd8 100%); }
    .steel-line { background: linear-gradient(90deg, transparent, #1a1a1a, transparent); height: 1px; }
    .glass-card { backdrop-filter: blur(20px) saturate(180%); background: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.9); }
    .noise-bg::before { content: ''; position: absolute; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E"); pointer-events: none; z-index: 0; }
    @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
    .shimmer-text { background: linear-gradient(90deg, #1a1a1a 0%, #6b6560 40%, #1a1a1a 60%, #6b6560 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: shimmer 4s linear infinite; }
    .marquee-track { animation: marquee 20s linear infinite; }
    @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    .hover-lift { transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.4s ease; }
    .hover-lift:hover { transform: translateY(-8px); box-shadow: 0 32px 64px rgba(0,0,0,0.12); }
    .card-shine { position: relative; overflow: hidden; }
    .card-shine::after { content: ''; position: absolute; top: -50%; left: -60%; width: 30%; height: 200%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); transform: skewX(-15deg); transition: left 0.6s ease; pointer-events: none; }
    .card-shine:hover::after { left: 120%; }
    .parallax-img { transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
    .img-card:hover .parallax-img { transform: scale(1.08); }
    input, textarea { outline: none; }
    input:focus, textarea:focus { border-color: #1a1a1a !important; }
  `}</style>
);

// ─── PLACEHOLDER IMAGE COMPONENT ────────────────────────────────────────────
const MetalPlaceholder = ({ className, aspectRatio = "4/3", label, variant = 0 }) => {
  const variants = [
    { bg: "linear-gradient(135deg, #c8c4be 0%, #e8e4df 30%, #b8b4ae 60%, #d4d0cb 100%)" },
    { bg: "linear-gradient(160deg, #d4d0cb 0%, #f0ede8 40%, #c4c0bb 70%, #e0dcd7 100%)" },
    { bg: "linear-gradient(120deg, #bab6b1 0%, #dedad5 35%, #aaa6a1 65%, #ccc8c3 100%)" },
    { bg: "linear-gradient(145deg, #e0dcd7 0%, #c8c4be 30%, #f0ede8 60%, #b4b0ab 100%)" },
    { bg: "linear-gradient(110deg, #d0ccc7 0%, #e8e4df 40%, #c0bcb7 70%, #dcdad5 100%)" },
    { bg: "linear-gradient(155deg, #c0bcb7 0%, #dedad5 35%, #aaa6a1 65%, #d0ccc7 100%)" },
  ];
  const v = variants[variant % variants.length];
  return (
    <div className={className} style={{ aspectRatio, background: v.bg, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,0,0,0.02) 40px, rgba(0,0,0,0.02) 41px)", pointerEvents: "none" }} />
      {label && (
        <div style={{ position: "absolute", bottom: 16, left: 16, background: "rgba(255,255,255,0.8)", backdropFilter: "blur(8px)", padding: "6px 14px", borderRadius: 4, fontSize: 11, fontFamily: "Syne, sans-serif", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1a1a1a" }}>
          {label}
        </div>
      )}
    </div>
  );
};

// ─── ANIMATED COUNTER ───────────────────────────────────────────────────────
const AnimatedCounter = ({ target, suffix = "", duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, target, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
};

// ─── NAV ────────────────────────────────────────────────────────────────────
const Nav = ({ activeSection }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);
  const links = ["Services", "Portfolio", "Process", "About", "Contact"];
  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: scrolled ? "16px 48px" : "28px 48px",
        transition: "padding 0.4s ease, background 0.4s ease, box-shadow 0.4s ease",
        background: scrolled ? "rgba(248,247,245,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        boxShadow: scrolled ? "0 1px 0 rgba(0,0,0,0.08)" : "none",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, background: "#1a1a1a", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 15L9 3L15 15" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5.5 10.5H12.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="font-heading" style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.04em" }}>STEEL STYLE</span>
      </div>
      <div style={{ display: "flex", gap: 40, alignItems: "center" }} className="hidden-mobile">
        {links.map(link => (
          <a key={link} href={`#${link.toLowerCase()}`} style={{
            fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 500,
            letterSpacing: "0.06em", textDecoration: "none", color: "#1a1a1a",
            textTransform: "uppercase", position: "relative", paddingBottom: 2,
          }}
            onMouseEnter={e => { e.target.style.opacity = "0.5"; }}
            onMouseLeave={e => { e.target.style.opacity = "1"; }}
          >
            {link}
          </a>
        ))}
        <a href="#contact" style={{
          background: "#1a1a1a", color: "white", padding: "10px 24px",
          borderRadius: 40, fontSize: 13, fontWeight: 500, letterSpacing: "0.06em",
          textDecoration: "none", textTransform: "uppercase", transition: "background 0.3s, transform 0.3s",
        }}
          onMouseEnter={e => { e.target.style.background = "#333"; e.target.style.transform = "scale(1.03)"; }}
          onMouseLeave={e => { e.target.style.background = "#1a1a1a"; e.target.style.transform = "scale(1)"; }}
        >
          Get Quote
        </a>
      </div>
    </motion.nav>
  );
};

// ─── HERO ────────────────────────────────────────────────────────────────────
const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 600], [0, -120]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <section style={{ minHeight: "100vh", position: "relative", display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden", background: "#f0ede8" }}>
      {/* Background layers */}
      <motion.div style={{ position: "absolute", inset: 0, y: y1 }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, #e8e4df 0%, #f5f3f0 40%, #ddd9d4 100%)" }} />
        {/* Architectural grid lines */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06 }} preserveAspectRatio="none">
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={i} x1={`${(i + 1) * 8.33}%`} y1="0" x2={`${(i + 1) * 8.33}%`} y2="100%" stroke="#1a1a1a" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={i} x1="0" y1={`${(i + 1) * 12.5}%`} x2="100%" y2={`${(i + 1) * 12.5}%`} stroke="#1a1a1a" strokeWidth="0.5" />
          ))}
        </svg>
        {/* Large metallic shapes */}
        <div style={{ position: "absolute", right: "-5%", top: "8%", width: "52%", height: "84%", borderRadius: "4px", overflow: "hidden", boxShadow: "0 60px 120px rgba(0,0,0,0.15)" }}>
          <MetalPlaceholder className="w-full h-full" aspectRatio="auto" variant={0} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to left, transparent 60%, #f0ede8)" }} />
        </div>
        <div style={{ position: "absolute", right: "40%", top: "16%", width: "18%", height: "32%", borderRadius: "4px", overflow: "hidden", boxShadow: "0 32px 64px rgba(0,0,0,0.1)", border: "1px solid rgba(255,255,255,0.7)" }}>
          <MetalPlaceholder className="w-full h-full" aspectRatio="auto" variant={2} />
        </div>
      </motion.div>

      {/* Content */}
      <motion.div style={{ opacity, position: "relative", zIndex: 2, padding: "0 48px 80px", maxWidth: 680 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}
        >
          <div style={{ width: 32, height: 1, background: "#1a1a1a" }} />
          <span className="font-heading" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6b6560" }}>Est. 2004 · Warsaw, Poland</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="font-display"
          style={{ fontSize: "clamp(52px, 7vw, 100px)", fontWeight: 300, lineHeight: 0.95, letterSpacing: "-0.02em", marginBottom: 32, color: "#1a1a1a" }}
        >
          Where Metal<br />
          <em style={{ fontStyle: "italic", fontWeight: 300 }}>Becomes</em><br />
          <span className="shimmer-text">Art</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          style={{ fontSize: 17, fontWeight: 300, lineHeight: 1.7, color: "#4a4542", maxWidth: 480, marginBottom: 44 }}
        >
          Premium metal construction and forging — staircases, railings, gates, and bespoke furniture crafted with architectural precision.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          style={{ display: "flex", gap: 16, flexWrap: "wrap" }}
        >
          <a href="#portfolio" style={{
            background: "#1a1a1a", color: "white", padding: "16px 40px",
            borderRadius: 4, fontSize: 13, fontWeight: 600, letterSpacing: "0.1em",
            textDecoration: "none", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 10,
            transition: "all 0.3s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "#333"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            View Projects
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7H12M8 3L12 7L8 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
          <a href="#contact" style={{
            background: "transparent", color: "#1a1a1a", padding: "16px 40px",
            borderRadius: 4, fontSize: 13, fontWeight: 600, letterSpacing: "0.1em",
            textDecoration: "none", textTransform: "uppercase", border: "1.5px solid rgba(26,26,26,0.3)",
            transition: "all 0.3s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#1a1a1a"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(26,26,26,0.3)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Get Consultation
          </a>
        </motion.div>
      </motion.div>

      {/* Stats cards */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        style={{
          position: "absolute", bottom: 80, right: 48, zIndex: 3,
          display: "flex", gap: 16,
        }}
      >
        {[
          { value: 20, suffix: "+", label: "Years of Experience" },
          { value: 1400, suffix: "+", label: "Completed Projects" },
          { value: 98, suffix: "%", label: "Custom Manufacturing" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 + i * 0.1 }}
            className="glass-card"
            style={{ padding: "20px 28px", borderRadius: 8, minWidth: 140 }}
          >
            <div className="font-display" style={{ fontSize: 40, fontWeight: 300, lineHeight: 1, color: "#1a1a1a", marginBottom: 4 }}>
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b6560" }}>{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
      >
        <span style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9b9690", fontFamily: "Syne, sans-serif", fontWeight: 600 }}>Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ width: 1, height: 40, background: "linear-gradient(to bottom, #1a1a1a, transparent)" }}
        />
      </motion.div>
    </section>
  );
};

// ─── MARQUEE ────────────────────────────────────────────────────────────────
const Marquee = () => {
  const items = ["Custom Forging", "Architectural Metal", "Precision Craft", "Premium Railings", "Bespoke Staircases", "Steel Gates", "Forged Furniture", "Industrial Design"];
  return (
    <div style={{ background: "#1a1a1a", padding: "18px 0", overflow: "hidden", position: "relative" }}>
      <div className="marquee-track" style={{ display: "flex", gap: 64, whiteSpace: "nowrap", width: "max-content" }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} className="font-heading" style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: i % 2 === 0 ? "white" : "#6b6560", display: "flex", alignItems: "center", gap: 64 }}>
            {item}
            {i < items.length * 2 - 1 && <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#4a4542", display: "inline-block" }} />}
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── SERVICES ────────────────────────────────────────────────────────────────
const services = [
  { title: "Railings", desc: "Architectural indoor & outdoor railings in forged and stainless steel.", tag: "Interior / Exterior", variant: 1 },
  { title: "Gates", desc: "Automated and manual gates — classic forge or sleek modern designs.", tag: "Security & Style", variant: 2 },
  { title: "Staircases", desc: "Full staircase structures: stringers, treads, balustrades. Raw or finished.", tag: "Structural", variant: 3 },
  { title: "Forged Furniture", desc: "One-of-a-kind tables, chairs, shelves — iron and steel as design material.", tag: "Bespoke", variant: 4 },
  { title: "Metal Structures", desc: "Load-bearing pergolas, canopies, mezzanines and architectural elements.", tag: "Engineering", variant: 0 },
  { title: "Custom Projects", desc: "From concept to installation — fully tailored to your vision.", tag: "Individual", variant: 5 },
];

const Services = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <section id="services" ref={ref} style={{ padding: "120px 48px", background: "#f8f7f5" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: 72 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 32, height: 1, background: "#1a1a1a" }} />
            <span className="font-heading" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6b6560" }}>What We Make</span>
          </div>
          <h2 className="font-display" style={{ fontSize: "clamp(40px, 5vw, 72px)", fontWeight: 300, lineHeight: 1.05, color: "#1a1a1a" }}>
            Crafted for<br /><em>Every Space</em>
          </h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 24 }}>
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="hover-lift card-shine img-card"
              style={{ background: "white", borderRadius: 8, overflow: "hidden", cursor: "pointer", border: "1px solid rgba(0,0,0,0.06)" }}
            >
              <div style={{ overflow: "hidden", height: 220 }}>
                <MetalPlaceholder className="parallax-img w-full h-full" aspectRatio="auto" label={s.tag} variant={s.variant} />
              </div>
              <div style={{ padding: "24px 28px 28px" }}>
                <h3 className="font-heading" style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.02em", marginBottom: 10, color: "#1a1a1a" }}>{s.title}</h3>
                <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.7, color: "#6b6560", marginBottom: 20 }}>{s.desc}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#1a1a1a" }}>
                  <span className="font-heading" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>Learn More</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7H12M8 3L12 7L8 11" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── PORTFOLIO ───────────────────────────────────────────────────────────────
const portfolioItems = [
  { cat: "Staircases", title: "Villa Residence — Poznań", variant: 0, size: "large" },
  { cat: "Railings", title: "Office Tower — Warsaw", variant: 1, size: "small" },
  { cat: "Gates", title: "Manor Estate — Kraków", variant: 2, size: "small" },
  { cat: "Furniture", title: "Designer Loft — Wrocław", variant: 3, size: "medium" },
  { cat: "Staircases", title: "Penthouse — Gdańsk", variant: 4, size: "medium" },
  { cat: "Structures", title: "Pergola — Łódź", variant: 5, size: "large" },
  { cat: "Railings", title: "Residence — Katowice", variant: 0, size: "small" },
  { cat: "Gates", title: "Corporate HQ — Warsaw", variant: 1, size: "small" },
  { cat: "Furniture", title: "Hotel Lobby — Kraków", variant: 2, size: "medium" },
];

const Portfolio = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [modalItem, setModalItem] = useState(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const filters = ["All", "Staircases", "Railings", "Gates", "Furniture", "Structures"];
  const filtered = activeFilter === "All" ? portfolioItems : portfolioItems.filter(p => p.cat === activeFilter);

  return (
    <section id="portfolio" ref={ref} style={{ padding: "120px 48px", background: "white" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: 56, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 32 }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 32, height: 1, background: "#1a1a1a" }} />
              <span className="font-heading" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6b6560" }}>Our Work</span>
            </div>
            <h2 className="font-display" style={{ fontSize: "clamp(40px, 5vw, 72px)", fontWeight: 300, lineHeight: 1.05, color: "#1a1a1a" }}>
              Selected<br /><em>Projects</em>
            </h2>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {filters.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)} style={{
                padding: "10px 20px", borderRadius: 40, fontSize: 12, fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
                border: "1.5px solid",
                borderColor: activeFilter === f ? "#1a1a1a" : "rgba(0,0,0,0.15)",
                background: activeFilter === f ? "#1a1a1a" : "transparent",
                color: activeFilter === f ? "white" : "#6b6560",
                transition: "all 0.3s", fontFamily: "Syne, sans-serif",
              }}>
                {f}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Masonry-style grid */}
        <motion.div layout style={{ columns: "3 320px", gap: 20 }}>
          <AnimatePresence>
            {filtered.map((item, i) => (
              <motion.div
                key={item.title}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                onClick={() => setModalItem(item)}
                style={{
                  breakInside: "avoid", marginBottom: 20, cursor: "pointer",
                  borderRadius: 8, overflow: "hidden", position: "relative",
                  display: "block",
                }}
                className="img-card"
              >
                <MetalPlaceholder
                  className="parallax-img w-full"
                  aspectRatio={item.size === "large" ? "3/4" : item.size === "medium" ? "4/5" : "1/1"}
                  variant={item.variant}
                />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to top, rgba(26,26,26,0.7) 0%, transparent 50%)",
                  opacity: 0, transition: "opacity 0.4s",
                  display: "flex", flexDirection: "column", justifyContent: "flex-end",
                  padding: 24,
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "0"}
                >
                  <span className="font-heading" style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>{item.cat}</span>
                  <span style={{ fontSize: 16, fontWeight: 400, color: "white", fontFamily: "Syne, sans-serif" }}>{item.title}</span>
                  <span style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="white" strokeWidth="1.2" /><path d="M6 4V6.5L7.5 8" stroke="white" strokeWidth="1.2" strokeLinecap="round" /></svg>
                    View Project
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalItem(null)}
            style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={e => e.stopPropagation()}
              style={{ background: "white", borderRadius: 12, overflow: "hidden", maxWidth: 800, width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
            >
              <div style={{ flex: 1, overflow: "hidden", minHeight: 400 }}>
                <MetalPlaceholder className="w-full h-full" aspectRatio="16/9" variant={modalItem.variant} label={modalItem.cat} />
              </div>
              <div style={{ padding: "28px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span className="font-heading" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6b6560" }}>{modalItem.cat}</span>
                  <h3 className="font-display" style={{ fontSize: 28, fontWeight: 400, color: "#1a1a1a", marginTop: 4 }}>{modalItem.title}</h3>
                </div>
                <button onClick={() => setModalItem(null)} style={{ width: 44, height: 44, borderRadius: 44, border: "1.5px solid rgba(0,0,0,0.15)", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.style.borderColor = "#1a1a1a"; e.currentTarget.querySelector("path").setAttribute("stroke", "white"); }}
                  onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.15)"; e.currentTarget.querySelector("path").setAttribute("stroke", "#1a1a1a"); }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M12 2L2 12" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

// ─── WHY US ──────────────────────────────────────────────────────────────────
const whyUs = [
  { icon: "⬡", title: "Custom Production", desc: "Every piece is designed and manufactured to your exact specifications. No off-the-shelf compromises." },
  { icon: "◎", title: "Precise Measurements", desc: "Our engineers measure on-site to the millimetre before any material is cut or bent." },
  { icon: "▲", title: "Installation Included", desc: "Full white-glove installation by our own certified crew. You don't lift a finger." },
  { icon: "◈", title: "Premium Materials", desc: "We source from certified European steel mills. No recycled or substandard metal ever enters our workshop." },
  { icon: "◉", title: "Fast Deadlines", desc: "Our in-house production facility means no outsourcing delays. On time. Every time." },
];

const WhyUs = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <section id="about" ref={ref} style={{ padding: "120px 48px", background: "#f0ede8", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "50%", right: "-10%", transform: "translateY(-50%)", width: "40%", height: "80%", background: "linear-gradient(135deg, rgba(255,255,255,0.4), transparent)", borderRadius: 8, pointerEvents: "none" }} />
      <div style={{ maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: 72, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "end" }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 32, height: 1, background: "#1a1a1a" }} />
              <span className="font-heading" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6b6560" }}>Our Promise</span>
            </div>
            <h2 className="font-display" style={{ fontSize: "clamp(40px, 5vw, 72px)", fontWeight: 300, lineHeight: 1.05, color: "#1a1a1a" }}>
              Why Choose<br /><em>Steel Style</em>
            </h2>
          </div>
          <p style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.8, color: "#4a4542" }}>
            For two decades we have been setting the benchmark for metalwork in Poland. Our studio is where traditional blacksmith craft meets contemporary architectural design.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
          {whyUs.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              style={{ background: "white", borderRadius: 8, padding: "36px 32px", border: "1px solid rgba(0,0,0,0.06)", transition: "all 0.4s", cursor: "default" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.querySelectorAll("*").forEach(el => { if (el.style) el.style.color = el.style.color === "rgb(107, 101, 96)" || el.style.color === "#6b6560" ? "rgba(255,255,255,0.5)" : "white"; }); }}
              onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.querySelectorAll("*").forEach(el => { if (el.style) el.style.color = ""; }); }}
            >
              <div style={{ fontSize: 28, marginBottom: 20, color: "#1a1a1a" }}>{item.icon}</div>
              <h3 className="font-heading" style={{ fontSize: 17, fontWeight: 700, marginBottom: 12, color: "#1a1a1a" }}>{item.title}</h3>
              <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.7, color: "#6b6560" }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── PROCESS ─────────────────────────────────────────────────────────────────
const steps = [
  { n: "01", title: "Request", desc: "Send us your project brief, photos, or reference images. We respond within 24 hours." },
  { n: "02", title: "Consultation", desc: "A dedicated project manager reviews your needs. We discuss design, materials, and timeline." },
  { n: "03", title: "Measurement", desc: "Our technician visits the site for precision measurements. Nothing is left to guesswork." },
  { n: "04", title: "Production", desc: "Your piece is fabricated in our Warsaw workshop by master craftsmen using certified steel." },
  { n: "05", title: "Installation", desc: "Our installation crew arrives, executes cleanly, and leaves the space spotless." },
];

const Process = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <section id="process" ref={ref} style={{ padding: "120px 48px", background: "#1a1a1a", overflow: "hidden" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: 80 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.3)" }} />
            <span className="font-heading" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6b6560" }}>How It Works</span>
          </div>
          <h2 className="font-display" style={{ fontSize: "clamp(40px, 5vw, 72px)", fontWeight: 300, lineHeight: 1.05, color: "white" }}>
            From Idea to<br /><em style={{ color: "#c4c0bb" }}>Installation</em>
          </h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 0, position: "relative" }}>
          {/* Connector line */}
          <div style={{ position: "absolute", top: 40, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }} />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.12 }}
              style={{ padding: "0 24px", paddingTop: 0 }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                {/* Step indicator */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={inView ? { scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.12 }}
                  style={{ width: 80, height: 80, borderRadius: 80, border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32, background: "rgba(255,255,255,0.04)", backdropFilter: "blur(8px)" }}
                >
                  <span className="font-display" style={{ fontSize: 22, fontWeight: 300, color: "rgba(255,255,255,0.6)" }}>{step.n}</span>
                </motion.div>
                <h3 className="font-heading" style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 14, letterSpacing: "0.02em" }}>{step.title}</h3>
                <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.7, color: "rgba(255,255,255,0.45)" }}>{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── TESTIMONIALS ────────────────────────────────────────────────────────────
const testimonials = [
  { name: "Marek Kowalski", role: "Architect, Warsaw", text: "The staircase Steel Style created for our client's penthouse became the centrepiece of the entire interior. Precision, speed, and absolute professionalism.", rating: 5, initials: "MK" },
  { name: "Anna Wiśniewska", role: "Interior Designer, Kraków", text: "I've collaborated with many metal workshops over 15 years. Steel Style is in a completely different league — both in terms of quality and communication.", rating: 5, initials: "AW" },
  { name: "Tomasz Nowak", role: "Developer, Wrocław", text: "Ordered custom gates and railing for a residential complex. Delivered on time, installed perfectly. Will use again for our next project.", rating: 5, initials: "TN" },
  { name: "Katarzyna Dąbrowska", role: "Private Client, Gdańsk", text: "Absolutely beautiful custom balcony railings. The team was thorough, tidy, and the final result exceeded our expectations significantly.", rating: 5, initials: "KD" },
];

const Testimonials = () => {
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, []);
  return (
    <section ref={ref} style={{ padding: "120px 48px", background: "#f8f7f5" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          style={{ marginBottom: 72, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 32 }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 32, height: 1, background: "#1a1a1a" }} />
              <span className="font-heading" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6b6560" }}>Client Reviews</span>
            </div>
            <h2 className="font-display" style={{ fontSize: "clamp(40px, 5vw, 72px)", fontWeight: 300, lineHeight: 1.05, color: "#1a1a1a" }}>
              Trusted by<br /><em>Professionals</em>
            </h2>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} style={{ width: i === active ? 32 : 8, height: 8, borderRadius: 8, background: i === active ? "#1a1a1a" : "rgba(0,0,0,0.15)", border: "none", cursor: "pointer", transition: "all 0.3s" }} />
            ))}
          </div>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              style={{
                background: i === active ? "#1a1a1a" : "white",
                borderRadius: 8, padding: "36px 32px",
                border: `1px solid ${i === active ? "transparent" : "rgba(0,0,0,0.06)"}`,
                transition: "all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                cursor: "pointer", transform: i === active ? "scale(1.02)" : "scale(1)",
              }}
              onClick={() => setActive(i)}
            >
              <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
                {Array.from({ length: t.rating }).map((_, j) => (
                  <span key={j} style={{ fontSize: 14, color: i === active ? "#c4c0bb" : "#1a1a1a" }}>★</span>
                ))}
              </div>
              <p className="font-display" style={{ fontSize: 18, fontWeight: 300, lineHeight: 1.6, color: i === active ? "rgba(255,255,255,0.9)" : "#1a1a1a", marginBottom: 28, fontStyle: "italic" }}>
                "{t.text}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 44, background: i === active ? "rgba(255,255,255,0.12)" : "#f0ede8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="font-heading" style={{ fontSize: 13, fontWeight: 700, color: i === active ? "rgba(255,255,255,0.7)" : "#1a1a1a" }}>{t.initials}</span>
                </div>
                <div>
                  <div className="font-heading" style={{ fontSize: 14, fontWeight: 700, color: i === active ? "white" : "#1a1a1a", letterSpacing: "0.02em" }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: i === active ? "rgba(255,255,255,0.4)" : "#9b9690" }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── CONTACT ─────────────────────────────────────────────────────────────────
const Contact = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const inputStyle = { width: "100%", background: "transparent", border: "none", borderBottom: "1.5px solid rgba(255,255,255,0.2)", padding: "14px 0", fontSize: 15, fontWeight: 300, color: "white", fontFamily: "DM Sans, sans-serif", transition: "border-color 0.3s", caretColor: "white" };
  return (
    <section id="contact" ref={ref} style={{ padding: "120px 48px", background: "#1a1a1a", position: "relative", overflow: "hidden" }}>
      {/* BG accent */}
      <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "50%", height: "140%", background: "radial-gradient(ellipse, rgba(196,192,187,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start", position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.3)" }} />
            <span className="font-heading" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#6b6560" }}>Get In Touch</span>
          </div>
          <h2 className="font-display" style={{ fontSize: "clamp(40px, 5vw, 72px)", fontWeight: 300, lineHeight: 1.05, color: "white", marginBottom: 32 }}>
            Start Your<br /><em style={{ color: "#c4c0bb" }}>Project Today</em>
          </h2>
          <p style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.8, color: "rgba(255,255,255,0.45)", marginBottom: 56, maxWidth: 420 }}>
            Tell us what you're imagining. We'll turn it into steel.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 48 }}>
            {[
              { icon: "📞", label: "+48 123 456 789", sub: "Mon–Fri, 8AM–6PM" },
              { icon: "📧", label: "hello@steelstyle.pl", sub: "Reply within 24h" },
              { icon: "📍", label: "ul. Stalowa 12, Warsaw", sub: "Workshop & Showroom" },
            ].map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <span style={{ fontSize: 18 }}>{c.icon}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "white", marginBottom: 2 }}>{c.label}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{c.sub}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "WhatsApp", color: "#25D366", icon: "💬" },
              { label: "Telegram", color: "#2CA5E0", icon: "✈️" },
            ].map(btn => (
              <button key={btn.label} style={{
                padding: "14px 28px", borderRadius: 4, border: "none", cursor: "pointer",
                background: btn.color, color: "white", fontSize: 13, fontWeight: 600,
                letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "Syne, sans-serif",
                display: "flex", alignItems: "center", gap: 8, transition: "transform 0.3s, opacity 0.3s",
              }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {btn.icon} {btn.label}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "48px 44px" }}
        >
          <h3 className="font-heading" style={{ fontSize: 20, fontWeight: 700, color: "white", marginBottom: 8, letterSpacing: "0.02em" }}>Request a Quote</h3>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 44 }}>We'll prepare a detailed proposal within 48 hours.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {[
              { key: "name", label: "Full Name", type: "text", placeholder: "Jan Kowalski" },
              { key: "email", label: "Email Address", type: "email", placeholder: "jan@example.com" },
              { key: "phone", label: "Phone Number", type: "tel", placeholder: "+48 ..." },
            ].map(field => (
              <div key={field.key} style={{ position: "relative" }}>
                <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 4, fontFamily: "Syne, sans-serif" }}>{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData[field.key]}
                  onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                  style={{ ...inputStyle }}
                  onFocus={e => { e.target.style.borderBottomColor = "rgba(255,255,255,0.7)"; }}
                  onBlur={e => { e.target.style.borderBottomColor = "rgba(255,255,255,0.2)"; }}
                />
              </div>
            ))}
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 4, fontFamily: "Syne, sans-serif" }}>Project Description</label>
              <textarea
                rows={4}
                placeholder="Describe your project — type, size, location, timeline..."
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                style={{ ...inputStyle, resize: "none", display: "block" }}
                onFocus={e => { e.target.style.borderBottomColor = "rgba(255,255,255,0.7)"; }}
                onBlur={e => { e.target.style.borderBottomColor = "rgba(255,255,255,0.2)"; }}
              />
            </div>
            <button style={{
              background: "white", color: "#1a1a1a", padding: "18px 0",
              borderRadius: 4, border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", fontFamily: "Syne, sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              transition: "all 0.3s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f0ede8"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Send Request
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7H12M8 3L12 7L8 11" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ─── FOOTER ──────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer style={{ background: "#111", padding: "64px 48px 40px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 64 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, background: "white", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 15L9 3L15 15" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5.5 10.5H12.5" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-heading" style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.04em", color: "white" }}>STEEL STYLE</span>
          </div>
          <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.7, color: "rgba(255,255,255,0.35)", maxWidth: 280 }}>
            Premium metal construction and forging in Warsaw. Custom staircases, railings, gates and furniture since 2004.
          </p>
        </div>
        {[
          { heading: "Services", links: ["Railings", "Gates", "Staircases", "Furniture", "Structures"] },
          { heading: "Company", links: ["About Us", "Portfolio", "Process", "Testimonials", "Careers"] },
          { heading: "Contact", links: ["+48 123 456 789", "hello@steelstyle.pl", "ul. Stalowa 12", "Warsaw, Poland"] },
        ].map((col, i) => (
          <div key={i}>
            <h4 className="font-heading" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>{col.heading}</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {col.links.map(link => (
                <a key={link} href="#" style={{ fontSize: 14, fontWeight: 300, color: "rgba(255,255,255,0.4)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color = "white"}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
                >{link}</a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontWeight: 300 }}>© 2024 Steel Style sp. z o.o. All rights reserved.</span>
        <div style={{ display: "flex", gap: 24 }}>
          {["Instagram", "Facebook", "LinkedIn", "Behance"].map(s => (
            <a key={s} href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textDecoration: "none", transition: "color 0.2s", fontFamily: "Syne, sans-serif", fontWeight: 600, letterSpacing: "0.06em" }}
              onMouseEnter={e => e.target.style.color = "white"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.25)"}
            >{s}</a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  return (
    <>
      <FontLink />
      <AnimatePresence>
        {!loaded && (
          <motion.div
            key="loader"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="font-display"
              style={{ fontSize: 36, fontWeight: 300, color: "white", letterSpacing: "0.08em" }}
            >
              STEEL STYLE
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ background: "#f8f7f5" }}>
        <Nav />
        <Hero />
        <Marquee />
        <Services />
        <Portfolio />
        <WhyUs />
        <Process />
        <Testimonials />
        <Contact />
        <Footer />
      </div>
    </>
  );
}
