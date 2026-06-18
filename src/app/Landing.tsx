import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, ShoppingCart, Globe, Store,
  ArrowRight, CheckCircle, QrCode, Users, BarChart2,
  AlertCircle, Clock, X, ChevronDown, CheckCircle2,
  Bell, Activity,
  MapPin, Truck, Github, BookOpen, Sparkles,
  ChevronRight, Menu,
} from "lucide-react";
import { translations, type Locale, localeLabels, localeFull } from "../i18n";



interface Props {
  onLogin: () => void;
  onRegister: () => void;
}

/* ─── Design Tokens ─────────────────────────────────────────────────────────── */
const N   = "#1A3A6C";   // Navy Primary
const N2  = "#1E4585";   // Navy Hover
const N3  = "#142844";   // Navy Dark (sidebar)
const BG  = "#F6F4F0";   // Warm cream
const W   = "#FFFFFF";
const TXT = "#1C1F26";
const T2  = "#737783";
const BDR = "#E3E0D8";
const AMB = "#E2A44D";   // Amber accent
const GRN = "#2E7D4F";   // Success green

/* ─── Motion Variants ─────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};


/* ─── Feature icons ─────────────────────────────────────────────────────────── */
const featureIcons = [MapPin, ShoppingCart, Activity, QrCode, Globe, Users];

/* ─── Logo ─────────────────────────────────────────────────────────────────── */
function Logo({ size = 28, color = "#1A3A6C", light = false }: { size?: number; color?: string; light?: boolean }) {
  const c = light ? "rgba(255,255,255,0.95)" : color;
  const ca = light ? "rgba(255,255,255,0.4)" : `${color}60`;
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-label="Stokly logo">
      <rect x="2"  y="2"  width="11" height="11" rx="2.5" fill={c} />
      <rect x="15" y="2"  width="11" height="11" rx="2.5" fill={c} fillOpacity="0.35" />
      <rect x="2"  y="15" width="11" height="11" rx="2.5" fill={c} fillOpacity="0.35" />
      <rect x="15" y="15" width="11" height="11" rx="2.5" fill={c} />
    </svg>
  );
}

/* ─── Locale Switcher ─────────────────────────────────────────────────────── */
function LocaleSwitcher({ locale, setLocale, onDark = false }: { locale: Locale; setLocale: (l: Locale) => void; onDark?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const locales: Locale[] = ["en", "pl", "uk"];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }} id="locale-switcher">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        style={{
          display: "flex", alignItems: "center", gap: 6,
          borderRadius: 8, padding: "7px 12px", cursor: "pointer",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: "0.82rem", fontWeight: 700,
          color: onDark ? "rgba(255,255,255,0.75)" : TXT,
          background: onDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.5)",
          border: onDark ? "1px solid rgba(255,255,255,0.2)" : `1px solid ${BDR}`,
          backdropFilter: "blur(12px)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = onDark ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.85)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = onDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.5)"; }}
      >
        {localeLabels[locale]}
        <ChevronDown size={11} style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0)" }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              background: W, borderRadius: 12,
              border: `1px solid ${BDR}`,
              boxShadow: "0 16px 48px -8px rgba(26,58,108,0.18), 0 4px 16px rgba(0,0,0,0.06)",
              zIndex: 100, overflow: "hidden", minWidth: 152,
            }}
          >
            {locales.map(l => (
              <button
                key={l}
                role="option"
                aria-selected={l === locale}
                onClick={() => { setLocale(l); setOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10, width: "100%",
                  padding: "10px 14px",
                  background: l === locale ? `rgba(26,58,108,0.06)` : "transparent",
                  border: "none", cursor: "pointer", textAlign: "left",
                  fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.875rem",
                  fontWeight: l === locale ? 700 : 500,
                  color: l === locale ? N : TXT,
                  transition: "background 0.12s",
                }}
                onMouseEnter={e => l !== locale && (e.currentTarget.style.background = `rgba(26,58,108,0.04)`)}
                onMouseLeave={e => l !== locale && (e.currentTarget.style.background = "transparent")}
              >
                <span style={{
                  fontSize: "0.72rem", fontFamily: "'DM Mono',monospace", fontWeight: 600,
                  color: l === locale ? N : T2, minWidth: 22,
                }}>
                  {localeLabels[l]}
                </span>
                {localeFull[l]}
                {l === locale && <CheckCircle2 size={14} color={N} style={{ marginLeft: "auto" }} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Dashboard Mockup ─────────────────────────────────────────────────────── */
function DashboardMockup() {
  const [tick, setTick] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setTick(v => v + 1), 2200);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setIsAnimating(false);
    }, 10000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, []);

  const stats = [
    { label: "Active Orders", value: "24", delta: "+3", color: "#3B82F6" },
    { label: "Total SKUs", value: "1,847", delta: "+12", color: GRN },
    { label: "In Transit", value: "8", delta: "", color: AMB },
    { label: "Revenue MTD", value: "€12.4k", delta: "+18%", color: N },
  ];

  const barHeights = [40, 65, 55, 80, 60, 75, 90];
  const barHeights2 = [25, 40, 30, 50, 35, 45, 55];

  const movements = [
    { type: "RECEIVE", product: "Wireless Earbuds Pro", qty: "+24", color: GRN, time: "2m ago" },
    { type: "SALE", product: "Leather Wallet RFID", qty: "-2", color: "#F59E0B", time: "5m ago" },
    { type: "TRANSFER", product: "USB-C Hub 7-Port", qty: "→", color: "#3B82F6", time: "12m ago" },
  ];

  return (
    <div style={{
      background: BG, borderRadius: 20, overflow: "hidden",
      border: `1px solid ${BDR}`,
      boxShadow: "0 32px 80px -16px rgba(26,58,108,0.22), 0 8px 32px rgba(0,0,0,0.05)",
    }}>
      {/* Window chrome */}
      <div style={{
        height: 44, background: W, borderBottom: `1px solid ${BDR}`,
        display: "flex", alignItems: "center", padding: "0 20px", gap: 8,
      }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FCA5A5" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FCD34D" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#86EFAC" }} />
        <div style={{
          flex: 1, height: 22, background: BG, borderRadius: 6, marginLeft: 8,
          border: `1px solid ${BDR}`, display: "flex", alignItems: "center",
          padding: "0 10px", gap: 6,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: GRN }} />
          <span style={{ fontSize: "0.7rem", fontFamily: "'DM Mono',monospace", color: T2 }}>
            app.stokly.io/dashboard
          </span>
        </div>
      </div>

      <div style={{ display: "flex", height: 360 }}>
        {/* Sidebar */}
        <div style={{
          width: 52, background: N3, display: "flex", flexDirection: "column",
          alignItems: "center", padding: "16px 0", gap: 8,
        }}>
          <div style={{ padding: "6px", marginBottom: 8 }}>
            <Logo size={22} light />
          </div>
          {[BarChart2, Store, Package, ShoppingCart, Truck, QrCode, Users].map((Icon, i) => (
            <div key={i} style={{
              width: 36, height: 36, borderRadius: 8,
              background: i === 0 ? "rgba(255,255,255,0.15)" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}>
              <Icon size={16} color={i === 0 ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.35)"} />
            </div>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10, overflowY: "hidden" }}>
          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 800, color: TXT }}>Dashboard</span>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: BG, border: `1px solid ${BDR}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bell size={12} color={T2} />
              </div>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: N, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "0.6rem", fontWeight: 700, color: W }}>JK</span>
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 7 }}>
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                animate={isAnimating ? { scale: tick % 4 === i ? [1, 1.02, 1] : 1 } : { scale: 1 }}
                transition={{ duration: 0.4 }}
                style={{
                  background: W, borderRadius: 10, padding: "10px 12px",
                  border: `1px solid ${BDR}`,
                  boxShadow: "0 2px 8px rgba(26,58,108,0.04)",
                }}
              >
                <div style={{ fontSize: "0.62rem", color: T2, fontWeight: 600, marginBottom: 3 }}>{s.label}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                  <span style={{ fontSize: "1.1rem", fontWeight: 800, color: TXT, letterSpacing: "-0.02em" }}>{s.value}</span>
                  {s.delta && (
                    <span style={{ fontSize: "0.6rem", fontWeight: 700, color: GRN, background: "rgba(46,125,79,0.08)", padding: "1px 5px", borderRadius: 4 }}>
                      {s.delta}
                    </span>
                  )}
                </div>
                <div style={{ marginTop: 6, height: 3, borderRadius: 2, background: BG, overflow: "hidden" }}>
                  <motion.div
                    animate={isAnimating
                      ? { width: ["60%", "78%", "60%"] }
                      : { width: "70%" }}
                    transition={isAnimating
                      ? { duration: 3, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }
                      : { duration: 0.6, ease: "easeOut" }}
                    style={{ height: "100%", background: s.color, borderRadius: 2 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts row */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 7, flex: 1 }}>
            {/* Bar chart */}
            <div style={{
              background: W, borderRadius: 10, padding: "10px 12px",
              border: `1px solid ${BDR}`,
              display: "flex", flexDirection: "column", gap: 8,
            }}>
              <div style={{ fontSize: "0.62rem", fontWeight: 700, color: TXT }}>Stock Flow — 7 days</div>
              <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 3 }}>
                {barHeights.map((h, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", gap: 1, alignItems: "flex-end" }}>
                    <motion.div
                      animate={isAnimating
                        ? { height: [`${h * 0.8}%`, `${h}%`, `${h * 0.8}%`] }
                        : { height: `${h}%` }}
                      transition={isAnimating
                        ? { duration: 2.5, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }
                        : { duration: 0.5, ease: "easeOut" }}
                      style={{ flex: 1, background: N, borderRadius: "3px 3px 0 0", opacity: 0.85 }}
                    />
                    <motion.div
                      animate={isAnimating
                        ? { height: [`${barHeights2[i] * 0.8}%`, `${barHeights2[i]}%`, `${barHeights2[i] * 0.8}%`] }
                        : { height: `${barHeights2[i]}%` }}
                      transition={isAnimating
                        ? { duration: 2.5, repeat: Infinity, delay: i * 0.1 + 0.3, ease: "easeInOut" }
                        : { duration: 0.5, ease: "easeOut" }}
                      style={{ flex: 1, background: `${N}40`, borderRadius: "3px 3px 0 0" }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: N }} />
                  <span style={{ fontSize: "0.55rem", color: T2, fontWeight: 500 }}>In</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: `${N}40` }} />
                  <span style={{ fontSize: "0.55rem", color: T2, fontWeight: 500 }}>Out</span>
                </div>
              </div>
            </div>

            {/* Recent movements */}
            <div style={{
              background: W, borderRadius: 10, padding: "10px 12px",
              border: `1px solid ${BDR}`,
              display: "flex", flexDirection: "column", gap: 6,
            }}>
              <div style={{ fontSize: "0.62rem", fontWeight: 700, color: TXT, marginBottom: 2 }}>Recent Movements</div>
              {movements.map((m, i) => (
                <motion.div
                  key={i}
                  animate={isAnimating ? { opacity: tick % 3 === i ? [0.6, 1, 0.6] : 1 } : { opacity: 1 }}
                  transition={{ duration: 1.5 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 7, padding: "5px 7px",
                    background: BG, borderRadius: 7,
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                    background: `${m.color}15`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: "0.6rem", fontWeight: 700, color: m.color }}>{m.qty}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.58rem", fontWeight: 600, color: TXT, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{m.product}</div>
                    <div style={{ fontSize: "0.52rem", color: T2 }}>{m.time}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ─── Main Landing ─────────────────────────────────────────────────────────── */
export default function Landing({ onLogin, onRegister }: Props) {
  const [locale, setLocale] = useState<Locale>("en");
  const [scrolled, setScrolled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = translations[locale];

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const channels = locale === "uk"
    ? ["Rozetka", "WooCommerce", "Нова Пошта", "Meest", "Укрпошта", "Stripe"]
    : ["Allegro", "WooCommerce", "InPost", "DPD", "Nova Poshta", "Stripe"];

  /* Button styles */
  const btnPrimary: React.CSSProperties = {
    background: N, color: W, border: "none", borderRadius: 10,
    cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 700, fontSize: "0.9rem", padding: "13px 26px",
    display: "inline-flex", alignItems: "center", gap: 8,
    boxShadow: "0 4px 20px rgba(26,58,108,0.22), 0 1px 4px rgba(0,0,0,0.1)",
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
    letterSpacing: "-0.01em",
  };
  const btnGhost: React.CSSProperties = {
    background: "transparent", color: TXT,
    border: `1.5px solid ${BDR}`, borderRadius: 10,
    cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 600, fontSize: "0.9rem", padding: "12px 22px",
    display: "inline-flex", alignItems: "center", gap: 8,
    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
  };

  return (
    <div style={{ background: BG, color: TXT, fontFamily: "'Plus Jakarta Sans', sans-serif", overflowX: "hidden" }}>

      {/* ── Announcement Bar ── */}
      <AnimatePresence>
        {!dismissed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="landing-announcement"
            style={{ background: N, color: W, padding: "9px 2rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", position: "relative", overflow: "hidden" }}
          >
            {/* Subtle shimmer line */}
            <motion.div
              animate={{ x: ["-200%", "200%"] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
              style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)", pointerEvents: "none" }}
            />
            <Sparkles size={13} color={AMB} />
            <span style={{ fontSize: "0.82rem", fontWeight: 600, letterSpacing: "-0.01em" }}>{t.announcementBar}</span>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={onRegister}
              style={{ background: W, color: N, border: "none", borderRadius: 6, padding: "4px 12px", fontSize: "0.75rem", fontWeight: 800, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.01em" }}
            >
              {t.announcementCta}
            </motion.button>
            <button
              onClick={() => setDismissed(true)}
              aria-label="Dismiss announcement"
              style={{ position: "absolute", right: "1rem", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", display: "flex", padding: 4, borderRadius: 4, transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Navbar ── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "sticky", top: 0, zIndex: 50,
          background: scrolled ? "rgba(246,244,240,0.82)" : "rgba(246,244,240,0)",
          backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          borderBottom: scrolled ? `1px solid rgba(227,224,216,0.6)` : "1px solid transparent",
          boxShadow: scrolled ? "0 4px 24px rgba(26,58,108,0.06)" : "none",
          transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 68,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <Logo size={26} />
          <span style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.03em", color: TXT }}>{t.appName}</span>
        </div>

        {/* Nav links */}
        <div className="landing-nav-links" style={{ display: "flex", alignItems: "center", gap: "1.75rem" }}>
          {([
            [t.nav.features, "#features"],
            [t.nav.howItWorks, "#how-it-works"],
            [t.nav.pricing, "#pricing"],
          ] as [string, string][]).map(([label, href]) => (
            <a
              key={label} href={href}
              style={{ fontSize: "0.875rem", fontWeight: 600, color: T2, textDecoration: "none", transition: "color 0.15s", letterSpacing: "-0.01em" }}
              onMouseEnter={e => (e.currentTarget.style.color = TXT)}
              onMouseLeave={e => (e.currentTarget.style.color = T2)}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LocaleSwitcher locale={locale} setLocale={setLocale} />
          <div className="landing-nav-cta" style={{ display: "flex", gap: 8 }}>
            <motion.button
              whileHover={{ backgroundColor: "rgba(255,255,255,0.9)" }}
              whileTap={{ scale: 0.97 }}
              onClick={onLogin}
              style={{ ...btnGhost, padding: "9px 18px", fontSize: "0.85rem", background: "rgba(255,255,255,0.45)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
            >
              {t.nav.signIn}
            </motion.button>
            <motion.button
              whileHover={{ backgroundColor: N2, boxShadow: "0 6px 24px rgba(26,58,108,0.3)" }}
              whileTap={{ scale: 0.97 }}
              onClick={onRegister}
              style={{ ...btnPrimary, padding: "9px 20px", fontSize: "0.85rem" }}
            >
              {t.nav.getStarted} <ArrowRight size={14} />
            </motion.button>
          </div>
          <button
            className="landing-hamburger"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} color={TXT} />
          </button>
        </div>
      </motion.nav>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="landing-mobile-menu open"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="landing-mobile-menu-panel"
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Logo size={24} />
                  <span style={{ fontWeight: 800, fontSize: "1.1rem", color: TXT }}>{t.appName}</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} style={{ background: BG, border: "none", cursor: "pointer", padding: 8, borderRadius: 8, color: T2 }}>
                  <X size={18} />
                </button>
              </div>
              {([
                [t.nav.features, "#features"],
                [t.nav.howItWorks, "#how-it-works"],
                [t.nav.pricing, "#pricing"],
              ] as [string, string][]).map(([label, href]) => (
                <a key={label} href={href} onClick={() => setMobileMenuOpen(false)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 8px", fontSize: "1rem", fontWeight: 600, color: TXT, textDecoration: "none", borderBottom: `1px solid ${BDR}` }}
                >
                  {label}
                  <ChevronRight size={16} color={T2} />
                </a>
              ))}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: "1.5rem" }}>
                <button onClick={() => { setMobileMenuOpen(false); onLogin(); }}
                  style={{ ...btnGhost, justifyContent: "center", width: "100%", padding: "14px" }}>
                  {t.nav.signIn}
                </button>
                <button onClick={() => { setMobileMenuOpen(false); onRegister(); }}
                  style={{ ...btnPrimary, justifyContent: "center", width: "100%", padding: "14px" }}>
                  {t.nav.getStarted}
                </button>
              </div>
              <div style={{ marginTop: "auto", paddingTop: "1.5rem" }}>
                <LocaleSwitcher locale={locale} setLocale={setLocale} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="landing-hero" style={{ position: "relative", overflow: "hidden" }}>
        {/* Decorative background gradients */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{
            position: "absolute", top: "-20%", right: "5%", width: 600, height: 600,
            background: "radial-gradient(ellipse at center, rgba(26,58,108,0.07) 0%, transparent 70%)",
            borderRadius: "50%",
          }} />
          <div style={{
            position: "absolute", bottom: "-10%", left: "-5%", width: 400, height: 400,
            background: "radial-gradient(ellipse at center, rgba(226,164,77,0.06) 0%, transparent 70%)",
            borderRadius: "50%",
          }} />
        </div>

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "3rem 2rem 2.5rem", position: "relative", zIndex: 1 }}>
          <div className="landing-hero-grid" style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "3rem", alignItems: "center" }}>
            {/* Left: Text */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              {/* Badge */}
              <motion.div variants={fadeUp} style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "#FEF9EE", border: "1px solid #F6D87A",
                borderRadius: 8, padding: "6px 12px", marginBottom: "0.75rem",
              }}>
                <Clock size={13} color="#B45309" />
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#92400E", letterSpacing: "0.01em" }}>{t.heroBadge}</span>
              </motion.div>

              {/* Headline */}
              <motion.h1 variants={fadeUp} className="tx-xxl" style={{ color: TXT, margin: "0 0 0.85rem", lineHeight: 1.05 }}>
                {t.heroHeadline}
              </motion.h1>

              {/* Subtitle */}
              <motion.p variants={fadeUp} style={{
                fontSize: "1rem", lineHeight: 1.7, color: T2, maxWidth: 500,
                margin: "0 0 1.5rem", fontWeight: 500,
              }}>
                {t.heroSubtitle}
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: "1.25rem" }}>
                <motion.button
                  whileHover={{ backgroundColor: N2, boxShadow: "0 10px 30px rgba(26,58,108,0.3)", y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onRegister}
                  style={{ ...btnPrimary, padding: "13px 26px", fontSize: "0.93rem" }}
                >
                  {t.heroCta} <ArrowRight size={16} />
                </motion.button>
                <motion.button
                  whileHover={{ borderColor: N, color: N }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onLogin}
                  style={btnGhost}
                >
                  {t.nav.signIn}
                </motion.button>
              </motion.div>

              {/* Trust bullets */}
              <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
                {t.heroBullets.map(b => (
                  <div key={b} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <CheckCircle2 size={15} color={GRN} />
                    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: T2 }}>{b}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Dashboard mockup */}
            <motion.div
              className="landing-hero-preview"
              variants={scaleIn}
              initial="hidden"
              animate="show"
              style={{ position: "relative" }}
            >
              <DashboardMockup />

              {/* Floating notification badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                style={{
                position: "absolute", bottom: -16, left: -20, zIndex: 10,
                background: W, borderRadius: 12, padding: "11px 16px",
                border: `1px solid ${BDR}`,
                boxShadow: "0 10px 32px rgba(26,58,108,0.14), 0 3px 10px rgba(0,0,0,0.05)",
                display: "flex", alignItems: "center", gap: 10,
                backdropFilter: "blur(12px)",
              }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(46,125,79,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckCircle2 size={20} color={GRN} />
                </div>
                <div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 800, color: TXT, letterSpacing: "-0.01em" }}>Stock updated</div>
                  <div style={{ fontSize: "0.72rem", color: T2, fontWeight: 500 }}>Across 3 locations</div>
                </div>
              </motion.div>

              {/* Floating order badge */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                style={{
                position: "absolute", top: -12, right: -14, zIndex: 10,
                background: N, borderRadius: 10, padding: "8px 14px",
                boxShadow: "0 6px 20px rgba(26,58,108,0.28)",
                display: "flex", alignItems: "center", gap: 8,
              }}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#86EFAC" }} />
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: W, letterSpacing: "-0.01em" }}>Live sync active</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          PAIN POINTS
      ══════════════════════════════════════════════════════════════════════ */}
      <motion.section
        id="pain"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        style={{ background: W, borderTop: `1px solid ${BDR}`, borderBottom: `1px solid ${BDR}`, padding: "2.5rem 2rem" }}
      >
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: "1rem" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: AMB }} />
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: AMB, opacity: 0.5 }} />
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: AMB, opacity: 0.2 }} />
            </div>
            <h2 className="tx-xl" style={{ color: TXT, margin: "0.5rem 0 0" }}>{t.painHeadline}</h2>
          </motion.div>

          <div className="landing-pain-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.25rem" }}>
            {t.painItems.map((p, i) => (
              <motion.div
                variants={fadeUp}
                whileHover={{ scale: 1.02, boxShadow: "0 20px 48px rgba(26,58,108,0.2)" }}
                key={i}
                style={{
                  background: `linear-gradient(135deg, ${N3} 0%, ${N} 100%)`,
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 18, padding: "2rem",
                  display: "flex", alignItems: "flex-start", gap: 16,
                  boxShadow: "0 8px 28px rgba(26,58,108,0.18)",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  cursor: "default",
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, fontSize: "0.8rem", fontWeight: 800,
                  color: "rgba(255,255,255,0.85)", fontFamily: "'DM Mono',monospace",
                }}>0{i + 1}</div>
                <span style={{ fontSize: "1rem", color: "rgba(255,255,255,0.88)", lineHeight: 1.65, fontWeight: 500 }}>{p}</span>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp} style={{ textAlign: "center", marginTop: "3rem" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "rgba(26,58,108,0.04)", border: `1px solid ${BDR}`,
              borderRadius: 999, padding: "0.85rem 1.75rem",
              fontSize: "0.95rem", color: TXT, fontWeight: 600,
            }}>
              <CheckCircle2 size={18} color={GRN} style={{ flexShrink: 0 }} />
              {t.painClosure}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ══════════════════════════════════════════════════════════════════════
          FEATURES (BENTO GRID)
      ══════════════════════════════════════════════════════════════════════ */}
      <motion.section
        id="features"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        style={{ padding: "5rem 2rem", maxWidth: 1160, margin: "0 auto" }}
      >
        <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 800, color: N, letterSpacing: "0.12em", textTransform: "uppercase" }}>{t.featuresLabel}</span>
          <h2 className="tx-xl" style={{ color: TXT, margin: "0.75rem 0 1rem" }}>{t.featuresHeadline}</h2>
          <p style={{ fontSize: "1.05rem", color: T2, maxWidth: 520, margin: "0 auto", lineHeight: 1.75, fontWeight: 500 }}>{t.featuresSubtitle}</p>
        </motion.div>

        <div className="landing-features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {t.features.map((f, i) => {
            const Icon = featureIcons[i];
            return (
              <motion.div
                variants={fadeUp}
                whileHover={{ y: -5, boxShadow: "0 24px 56px rgba(26,58,108,0.1)" }}
                key={f.title}
                className="feature-card"
                style={{
                  background: W, borderRadius: 22, padding: "2.5rem",
                  border: `1px solid ${BDR}`,
                  boxShadow: "0 2px 12px rgba(26,58,108,0.04)",
                  display: "flex", flexDirection: "column", gap: 18,
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  cursor: "default",
                  alignItems: "flex-start",
                  textAlign: "left",
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: `linear-gradient(135deg, rgba(26,58,108,0.08) 0%, rgba(26,58,108,0.04) 100%)`,
                  color: N, display: "flex", alignItems: "center", justifyContent: "center",
                  border: "1px solid rgba(26,58,108,0.1)",
                }}>
                  <Icon size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: TXT, margin: "0 0 0.6rem", letterSpacing: "-0.02em" }}>{f.title}</h3>
                  <p style={{ fontSize: "0.92rem", lineHeight: 1.7, color: T2, margin: 0, fontWeight: 500 }}>{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ══════════════════════════════════════════════════════════════════════
          OUTCOMES — 3D FLIP CARDS
      ══════════════════════════════════════════════════════════════════════ */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        style={{ background: W, borderTop: `1px solid ${BDR}`, borderBottom: `1px solid ${BDR}`, padding: "4.5rem 2rem" }}
      >
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 800, color: N, letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: "0.75rem" }}>{t.outcomesLabel}</span>
            <h2 className="tx-xl" style={{ color: TXT, margin: 0 }}>{t.outcomesHeadline}</h2>
          </motion.div>

          <div className="outcome-flip-grid">
            {t.outcomes.map((o, i) => (
              <motion.div variants={fadeUp} key={i} className="flip-card" tabIndex={0}>
                <div className="flip-card-inner">
                  <div className="flip-card-front">
                    <AlertCircle size={22} color={AMB} style={{ marginBottom: "1rem", flexShrink: 0 }} />
                    <p style={{ fontSize: "0.98rem", color: TXT, fontWeight: 600, margin: 0, lineHeight: 1.65 }}>{o.before}</p>
                    <div className="outcome-hint">Hover <ArrowRight size={11} /></div>
                  </div>
                  <div className="flip-card-back">
                    <CheckCircle2 size={28} color={GRN} style={{ marginBottom: "1rem", flexShrink: 0 }} />
                    <p style={{ fontSize: "0.98rem", color: "#1A5C35", margin: 0, lineHeight: 1.65, fontWeight: 700 }}>{o.after}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ══════════════════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════════════════ */}
      <motion.section
        id="how-it-works"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        style={{ padding: "5rem 2rem", maxWidth: 1120, margin: "0 auto" }}
      >
        <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 800, color: N, letterSpacing: "0.12em", textTransform: "uppercase" }}>{t.howLabel}</span>
          <h2 className="tx-xl" style={{ color: TXT, margin: "0.75rem 0 0" }}>{t.howHeadline}</h2>
        </motion.div>

        <div className="landing-how-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "3rem", position: "relative" }}>
          {/* Connector line (desktop) */}
          <div className="landing-how-connector" style={{
            position: "absolute", top: 22, left: "calc(16.66% + 22px)", right: "calc(16.66% + 22px)",
            height: 2, borderTop: `2px dashed ${BDR}`, zIndex: 0,
          }} />

          {t.steps.map((s, i) => (
            <motion.div variants={fadeUp} key={i} style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "1.5rem" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: N, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.9rem", fontWeight: 800, color: W,
                  boxShadow: "0 8px 20px rgba(26,58,108,0.25)",
                  fontFamily: "'DM Mono',monospace",
                }}>
                  {i + 1}
                </div>
              </div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: TXT, margin: "0 0 0.7rem", letterSpacing: "-0.02em" }}>{s.title}</h3>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.75, color: T2, margin: 0, fontWeight: 500 }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeUp} style={{ textAlign: "center", marginTop: "4rem" }}>
          <motion.button
            whileHover={{ backgroundColor: N2, y: -2, boxShadow: "0 10px 30px rgba(26,58,108,0.28)" }}
            whileTap={{ scale: 0.97 }}
            onClick={onRegister}
            style={{ ...btnPrimary, padding: "15px 32px", fontSize: "0.975rem" }}
          >
            {t.howCta} <ArrowRight size={16} />
          </motion.button>
        </motion.div>
      </motion.section>

      {/* ══════════════════════════════════════════════════════════════════════
          INTEGRATIONS
      ══════════════════════════════════════════════════════════════════════ */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        style={{ background: W, borderTop: `1px solid ${BDR}`, borderBottom: `1px solid ${BDR}`, padding: "2.5rem 2rem" }}
      >
        <div style={{ maxWidth: 1120, margin: "0 auto", textAlign: "center" }}>
          <motion.p variants={fadeUp} style={{
            fontSize: "0.78rem", fontWeight: 800, color: T2, marginBottom: "1.75rem",
            textTransform: "uppercase", letterSpacing: "0.12em",
          }}>
            {t.integrationsLabel}
          </motion.p>
          <motion.div variants={fadeUp} style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            {channels.map(name => (
              <motion.div
                whileHover={{ scale: 1.04, borderColor: N, color: N, boxShadow: "0 4px 16px rgba(26,58,108,0.1)" }}
                key={name}
                style={{
                  borderRadius: 10, padding: "11px 24px",
                  fontSize: "0.9rem", fontWeight: 700, color: T2,
                  border: `1.5px solid ${BDR}`,
                  background: W, cursor: "default",
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  letterSpacing: "-0.01em",
                }}
              >
                {name}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ══════════════════════════════════════════════════════════════════════
          PRICING
      ══════════════════════════════════════════════════════════════════════ */}
      <motion.section
        id="pricing"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        style={{ padding: "5rem 2rem", maxWidth: 980, margin: "0 auto" }}
      >
        <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 800, color: N, letterSpacing: "0.12em", textTransform: "uppercase" }}>{t.pricingLabel}</span>
          <h2 className="tx-xl" style={{ color: TXT, margin: "0.75rem 0 1rem" }}>{t.pricingHeadline}</h2>
          <p style={{ fontSize: "1.05rem", color: T2, fontWeight: 500 }}>{t.pricingSubtitle}</p>
        </motion.div>

        <div className="landing-pricing-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Free */}
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -3 }}
            style={{
              background: W, borderRadius: 20, padding: "2.75rem",
              border: `1.5px solid ${BDR}`,
              boxShadow: "0 2px 16px rgba(26,58,108,0.04)",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div style={{ fontSize: "0.78rem", fontWeight: 800, color: T2, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5rem" }}>{t.freePlanLabel}</div>
            <div style={{ fontSize: "3.75rem", fontWeight: 800, letterSpacing: "-0.04em", color: TXT, lineHeight: 1, marginBottom: "0.5rem" }}>€0</div>
            <div style={{ fontSize: "0.9rem", color: T2, marginBottom: "2.25rem", paddingBottom: "2.25rem", borderBottom: `1px solid ${BDR}`, fontWeight: 500 }}>{t.freePlanNote}</div>
            {t.freePlanItems.map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <CheckCircle size={16} color={GRN} />
                <span style={{ fontSize: "0.95rem", color: TXT, fontWeight: 500 }}>{f}</span>
              </div>
            ))}
            <motion.button
              whileHover={{ backgroundColor: BG, borderColor: N }}
              whileTap={{ scale: 0.98 }}
              onClick={onRegister}
              style={{ ...btnGhost, width: "100%", justifyContent: "center", marginTop: "2rem", padding: "14px", fontSize: "0.975rem" }}
            >
              {t.freePlanCta}
            </motion.button>
          </motion.div>

          {/* Pro */}
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -3, boxShadow: "0 32px 72px rgba(26,58,108,0.32)" }}
            style={{
              background: `linear-gradient(150deg, ${N3} 0%, ${N} 60%, #1E4A7E 100%)`,
              borderRadius: 20, padding: "2.75rem", position: "relative", overflow: "hidden",
              boxShadow: "0 16px 48px rgba(26,58,108,0.28)",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Subtle radial glow */}
            <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

            <div style={{ position: "absolute", top: 20, right: 20, background: AMB, color: "#0B0907", fontSize: "0.7rem", fontWeight: 800, padding: "4px 12px", borderRadius: 6, letterSpacing: "0.05em" }}>
              {t.proBadge}
            </div>
            <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5rem" }}>{t.proPlanLabel}</div>
            <div style={{ fontSize: "3.75rem", fontWeight: 800, letterSpacing: "-0.04em", color: W, lineHeight: 1, marginBottom: "0.5rem" }}>
              €29<span style={{ fontSize: "1.35rem", fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>/mo</span>
            </div>
            <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.55)", marginBottom: "2.25rem", paddingBottom: "2.25rem", borderBottom: "1px solid rgba(255,255,255,0.12)", fontWeight: 500 }}>{t.proPlanNote}</div>
            {t.proPlanItems.map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <CheckCircle size={16} color="#86EFAC" />
                <span style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.88)", fontWeight: 500 }}>{f}</span>
              </div>
            ))}
            <motion.button
              whileHover={{ opacity: 0.93, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRegister}
              style={{
                width: "100%", marginTop: "2rem", padding: "14px",
                background: W, color: N, border: "none", borderRadius: 10,
                fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "0.975rem",
                cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              }}
            >
              {t.proPlanCta}
            </motion.button>
          </motion.div>
        </div>

        {/* Migration note */}
        <motion.div
          variants={fadeUp}
          style={{
            borderRadius: 14, padding: "1.35rem 1.75rem", marginTop: 20,
            display: "flex", alignItems: "flex-start", gap: 14,
            background: W, border: `1px solid ${BDR}`,
          }}
        >
          <CheckCircle size={18} color={GRN} style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: "0.9rem", color: TXT, margin: 0, lineHeight: 1.7, fontWeight: 600 }}>{t.migrationNote}</p>
        </motion.div>
      </motion.section>

      {/* ══════════════════════════════════════════════════════════════════════
          OPEN SOURCE
      ══════════════════════════════════════════════════════════════════════ */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        style={{ background: W, borderTop: `1px solid ${BDR}`, borderBottom: `1px solid ${BDR}`, padding: "2.5rem 2rem" }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <motion.span variants={fadeUp} style={{ fontSize: "0.78rem", fontWeight: 800, color: N, letterSpacing: "0.12em", textTransform: "uppercase" }}>{t.ossLabel}</motion.span>
          <motion.h2 variants={fadeUp} className="tx-l" style={{ color: TXT, margin: "1rem 0 1.25rem" }}>{t.ossHeadline}</motion.h2>
          <motion.p variants={fadeUp} style={{ fontSize: "1.05rem", color: T2, lineHeight: 1.8, marginBottom: "2.5rem", fontWeight: 500 }}>{t.ossBody}</motion.p>
          <motion.div variants={fadeUp} className="landing-oss-buttons" style={{ display: "flex", gap: 14, justifyContent: "center" }}>
            <motion.a
              whileHover={{ backgroundColor: BG, borderColor: N, color: N }}
              whileTap={{ scale: 0.97 }}
              href="#" style={{ ...btnGhost, textDecoration: "none", fontSize: "0.9rem", padding: "12px 22px" }}
            >
              <Github size={16} /> {t.ossGithub}
            </motion.a>
            <motion.a
              whileHover={{ backgroundColor: BG, borderColor: N, color: N }}
              whileTap={{ scale: 0.97 }}
              href="#" style={{ ...btnGhost, textDecoration: "none", fontSize: "0.9rem", padding: "12px 22px" }}
            >
              <BookOpen size={16} /> {t.ossDocs}
            </motion.a>
          </motion.div>
        </div>
      </motion.section>

      {/* ══════════════════════════════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════════════════════════════ */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        style={{
          background: `linear-gradient(150deg, ${N3} 0%, ${N} 55%, #1A4880 100%)`,
          padding: "5.5rem 2rem", textAlign: "center", position: "relative", overflow: "hidden",
        }}
      >
        {/* Decorative glows */}
        <div style={{ position: "absolute", top: "-30%", left: "20%", width: 500, height: 500, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-20%", right: "10%", width: 350, height: 350, borderRadius: "50%", background: "rgba(226,164,77,0.08)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 680, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <motion.h2 variants={fadeUp} className="tx-xl" style={{ color: W, margin: "0 0 1.5rem" }}>{t.ctaHeadline}</motion.h2>
          <motion.p variants={fadeUp} style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.65)", marginBottom: "3rem", lineHeight: 1.8, fontWeight: 500 }}>{t.ctaBody}</motion.p>
          <motion.button
            variants={fadeUp}
            whileHover={{ scale: 1.04, boxShadow: "0 16px 48px rgba(0,0,0,0.35)" }}
            whileTap={{ scale: 0.97 }}
            onClick={onRegister}
            style={{
              background: W, color: N, border: "none", borderRadius: 12,
              padding: "16px 40px", fontFamily: "'Plus Jakarta Sans',sans-serif",
              fontWeight: 800, fontSize: "1.05rem", cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 10,
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              letterSpacing: "-0.02em",
            }}
          >
            {t.ctaButton} <ArrowRight size={18} />
          </motion.button>
          <motion.p variants={fadeUp} style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.38)", marginTop: "1.5rem", fontWeight: 500 }}>{t.ctaNote}</motion.p>
        </div>
      </motion.section>

      {/* ── Footer ── */}
      <footer style={{ background: "#0C1929", padding: "3rem 2rem" }}>
        <div className="landing-footer-inner" style={{ maxWidth: 1120, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Logo size={24} light />
            <span style={{ fontWeight: 800, fontSize: "1rem", color: "rgba(157,176,200,0.9)", letterSpacing: "-0.02em" }}>{t.appName}</span>
            <span style={{
              fontSize: "0.68rem", color: "rgba(157,176,200,0.35)", marginLeft: 6,
              fontFamily: "'DM Mono',monospace", fontWeight: 500,
              background: "rgba(255,255,255,0.06)", padding: "2px 7px", borderRadius: 4,
            }}>{t.footerOss}</span>
          </div>
          <div className="landing-footer-links" style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            {["GitHub", "Docs", "Privacy", `© 2026 ${t.appName}`].map(l => (
              <span
                key={l}
                style={{ fontSize: "0.82rem", fontWeight: 500, color: "rgba(157,176,200,0.42)", cursor: l.startsWith("©") ? "default" : "pointer", transition: "color 0.15s", letterSpacing: "-0.01em" }}
                onMouseEnter={e => !l.startsWith("©") && (e.currentTarget.style.color = "rgba(157,176,200,0.82)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(157,176,200,0.42)")}
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
