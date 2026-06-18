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
/* ─── Pain Slider ─────────────────────────────────────────────────────────── */
function PainSlider({ items, headline, closure }: { items: string[]; headline: string; closure: string }) {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);

  const go = (next: number) => {
    setDir(next > active ? 1 : -1);
    setActive(next);
  };

  useEffect(() => {
    const t = setInterval(() => go((active + 1) % items.length), 4000);
    return () => clearInterval(t);
  }, [active, items.length]);

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d * 40 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
    exit: (d: number) => ({ opacity: 0, x: d * -40, transition: { duration: 0.3, ease: "easeIn" } }),
  };

  return (
    <motion.section
      id="pain"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{ background: W, borderTop: `1px solid ${BDR}`, borderBottom: `1px solid ${BDR}`, padding: "6rem 2rem" }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h2 className="tx-xl" style={{ color: TXT, margin: 0 }}>{headline}</h2>
        </div>

        {/* Slider card */}
        <div style={{
          position: "relative", overflow: "hidden",
          background: `linear-gradient(140deg, ${N3} 0%, ${N} 100%)`,
          borderRadius: 24, padding: "3rem 3.5rem",
          boxShadow: "0 24px 64px rgba(26,58,108,0.22)",
          minHeight: 200,
        }}>
          {/* Ambient glow */}
          <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

          <AnimatePresence custom={dir} mode="wait">
            <motion.div
              key={active}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <div style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: "0.72rem", fontWeight: 600,
                color: AMB, letterSpacing: "0.14em",
                textTransform: "uppercase", marginBottom: "1.25rem",
              }}>0{active + 1} / 0{items.length}</div>
              <p style={{
                fontSize: "clamp(1.35rem, 2.8vw, 2rem)",
                fontWeight: 700, color: W, margin: 0,
                lineHeight: 1.35, letterSpacing: "-0.02em",
                maxWidth: 620,
              }}>{items[active]}</p>
            </motion.div>
          </AnimatePresence>

          {/* Navigation dots */}
          <div style={{ display: "flex", gap: 8, marginTop: "2.5rem", alignItems: "center" }}>
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Slide ${i + 1}`}
                style={{
                  height: 6,
                  width: i === active ? 28 : 6,
                  borderRadius: 999,
                  background: i === active ? W : "rgba(255,255,255,0.28)",
                  border: "none", cursor: "pointer", padding: 0,
                  transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Closure pill */}
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "rgba(26,58,108,0.04)", border: `1px solid ${BDR}`,
            borderRadius: 999, padding: "0.7rem 1.5rem",
            fontSize: "0.9rem", color: TXT, fontWeight: 600,
          }}>
            <CheckCircle2 size={16} color={GRN} style={{ flexShrink: 0 }} />
            {closure}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ─── Outcomes Comparison ──────────────────────────────────────────────────── */
function OutcomesComparison({ outcomes, headline, label }: {
  outcomes: { before: string; after: string }[];
  headline: string;
  label: string;
}) {
  const [activeRow, setActiveRow] = useState(0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{ background: W, borderTop: `1px solid ${BDR}`, borderBottom: `1px solid ${BDR}`, padding: "3.5rem 2rem" }}
    >
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 800, color: N, letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginBottom: "0.55rem" }}>{label}</span>
          <h2 className="tx-xl" style={{ color: TXT, margin: 0 }}>{headline}</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Before column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{
              fontSize: "0.7rem", fontWeight: 800, color: AMB,
              textTransform: "uppercase", letterSpacing: "0.1em",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              paddingBottom: "0.75rem", borderBottom: `1px solid ${BDR}`,
            }}>
              <AlertCircle size={12} />
              Before Stokly
            </div>
            {outcomes.map((o, i) => (
              <button
                key={i}
                onClick={() => setActiveRow(i)}
                style={{
                  textAlign: "center", cursor: "pointer",
                  background: i === activeRow ? "rgba(226,164,77,0.07)" : BG,
                  border: `1.5px solid ${i === activeRow ? AMB : "transparent"}`,
                  borderRadius: 12, padding: "0.9rem 1.1rem",
                  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  background: i === activeRow ? `rgba(226,164,77,0.15)` : "rgba(115,119,131,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.25s",
                }}>
                  <AlertCircle size={12} color={i === activeRow ? AMB : T2} />
                </div>
                <span style={{
                  fontSize: "0.88rem", fontWeight: i === activeRow ? 700 : 500,
                  color: i === activeRow ? TXT : T2, lineHeight: 1.55,
                  transition: "all 0.25s",
                }}>{o.before}</span>
              </button>
            ))}
          </div>

          {/* After column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{
              fontSize: "0.7rem", fontWeight: 800, color: GRN,
              textTransform: "uppercase", letterSpacing: "0.1em",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              paddingBottom: "0.75rem", borderBottom: `1px solid ${BDR}`,
            }}>
              <CheckCircle2 size={12} />
              With Stokly
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRow}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  flex: 1,
                  background: "linear-gradient(135deg, #EBF7F0 0%, #D6F0E2 100%)",
                  border: `1.5px solid #BEE0CB`,
                  borderRadius: 16, padding: "1.1rem 1.5rem",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  minHeight: 120,
                  textAlign: "center",
                }}
              >
                <CheckCircle2 size={22} color={GRN} style={{ marginBottom: "0.65rem" }} />
                <p style={{
                  fontSize: "0.95rem", color: "#1A5C35",
                  margin: 0, lineHeight: 1.6, fontWeight: 700,
                }}>{outcomes[activeRow]?.after}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.section>
  );
}


function DashboardMockup() {

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
              <div
                key={s.label}
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
                  <div
                    style={{
                      height: "100%",
                      background: s.color,
                      borderRadius: 2,
                      width: ["72%", "85%", "58%", "76%"][i],
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>
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
                  <div key={i} style={{ flex: 1, display: "flex", gap: 1, alignItems: "flex-end", height: "100%" }}>
                    <div
                      style={{
                        flex: 1,
                        background: N,
                        borderRadius: "3px 3px 0 0",
                        opacity: 0.85,
                        height: `${h}%`,
                        transition: `height 0.6s ease ${i * 0.06}s`,
                      }}
                    />
                    <div
                      style={{
                        flex: 1,
                        background: `${N}40`,
                        borderRadius: "3px 3px 0 0",
                        height: `${barHeights2[i]}%`,
                        transition: `height 0.6s ease ${i * 0.06 + 0.15}s`,
                      }}
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
                <div
                  key={i}
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
                </div>
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
    <div style={{ background: BG, color: TXT, fontFamily: "'Plus Jakarta Sans', sans-serif", overflowX: "hidden", paddingTop: dismissed ? 64 : 104 }}>

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
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          background: scrolled ? "rgba(246,244,240,0.92)" : "rgba(246,244,240,0.97)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: `1px solid ${scrolled ? "rgba(227,224,216,0.7)" : "rgba(227,224,216,0.4)"}`,
          boxShadow: scrolled ? "0 4px 24px rgba(26,58,108,0.08)" : "0 1px 0 rgba(227,224,216,0.5)",
          transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <Logo size={26} />
          <span style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.03em", color: TXT }}>{t.appName}</span>
        </div>

        {/* Right side — nav links + locale + CTAs */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Nav links */}
          <div className="landing-nav-links" style={{ display: "flex", alignItems: "center", gap: "1.75rem", marginRight: 6 }}>
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
      <section className="landing-hero" style={{ position: "relative", overflow: "visible" }}>
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

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "5.5rem 2rem 4.5rem", position: "relative", zIndex: 1 }}>
          <div className="landing-hero-grid" style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "3.5rem", alignItems: "center" }}>
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
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
                style={{
                position: "absolute", bottom: 20, left: -24, zIndex: 10,
                background: W, borderRadius: 12, padding: "10px 14px",
                border: `1px solid ${BDR}`,
                boxShadow: "0 10px 32px rgba(26,58,108,0.14), 0 3px 10px rgba(0,0,0,0.05)",
                display: "flex", alignItems: "center", gap: 10,
                backdropFilter: "blur(12px)",
              }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(46,125,79,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckCircle2 size={17} color={GRN} />
                </div>
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 800, color: TXT, letterSpacing: "-0.01em" }}>Stock updated</div>
                  <div style={{ fontSize: "0.68rem", color: T2, fontWeight: 500 }}>Across 3 locations</div>
                </div>
              </motion.div>

              {/* Floating order badge */}
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.2, repeatType: "mirror" }}
                style={{
                position: "absolute", top: 16, right: -18, zIndex: 10,
                background: N, borderRadius: 10, padding: "7px 13px",
                boxShadow: "0 6px 20px rgba(26,58,108,0.28)",
                display: "flex", alignItems: "center", gap: 7,
              }}
              >
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#86EFAC" }} />
                <span style={{ fontSize: "0.74rem", fontWeight: 700, color: W, letterSpacing: "-0.01em" }}>Live sync active</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          PAIN POINTS
      ══════════════════════════════════════════════════════════════════════ */}
      <PainSlider items={t.painItems} headline={t.painHeadline} closure={t.painClosure} />

      {/* ══════════════════════════════════════════════════════════════════════
          FEATURES (BENTO GRID)
      ══════════════════════════════════════════════════════════════════════ */}
      <motion.section
        id="features"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ padding: "3.5rem 2rem", maxWidth: 1160, margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: N, letterSpacing: "0.12em", textTransform: "uppercase" }}>{t.featuresLabel}</span>
          <h2 className="tx-xl" style={{ color: TXT, margin: "0.6rem 0 0.65rem" }}>{t.featuresHeadline}</h2>
          <p style={{ fontSize: "0.975rem", color: T2, maxWidth: 480, margin: "0 auto", lineHeight: 1.65, fontWeight: 500 }}>{t.featuresSubtitle}</p>
        </div>

        <div className="landing-features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {t.features.map((f, i) => {
            const Icon = featureIcons[i];
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.05 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: i * 0.07 }}
                whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(26,58,108,0.1)" }}
                className="feature-card"
                style={{
                  background: W, borderRadius: 16, padding: "1.5rem",
                  border: `1px solid ${BDR}`,
                  boxShadow: "0 2px 8px rgba(26,58,108,0.04)",
                  display: "flex", flexDirection: "column", gap: 12,
                  transition: "box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  cursor: "default",
                  alignItems: "flex-start",
                  textAlign: "left",
                }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 11,
                  background: `linear-gradient(135deg, rgba(26,58,108,0.08) 0%, rgba(26,58,108,0.04) 100%)`,
                  color: N, display: "flex", alignItems: "center", justifyContent: "center",
                  border: "1px solid rgba(26,58,108,0.1)", flexShrink: 0,
                }}>
                  <Icon size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 800, color: TXT, margin: "0 0 0.4rem", letterSpacing: "-0.02em" }}>{f.title}</h3>
                  <p style={{ fontSize: "0.875rem", lineHeight: 1.65, color: T2, margin: 0, fontWeight: 500 }}>{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ══════════════════════════════════════════════════════════════════════
          OUTCOMES — 3D FLIP CARDS
      ══════════════════════════════════════════════════════════════════════ */}
      <OutcomesComparison outcomes={t.outcomes} headline={t.outcomesHeadline} label={t.outcomesLabel} />

      {/* ══════════════════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════════════════ */}
      <motion.section
        id="how-it-works"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ padding: "3.5rem 2rem", maxWidth: 1120, margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: N, letterSpacing: "0.12em", textTransform: "uppercase" }}>{t.howLabel}</span>
          <h2 className="tx-xl" style={{ color: TXT, margin: "0.6rem 0 0" }}>{t.howHeadline}</h2>
        </div>

        {/* Steps using flex so connector lines are perfectly centred on circles */}
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          {t.steps.map((s, i) => (
            <React.Fragment key={i}>
              <motion.div
                style={{ flex: 1 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.05 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: i * 0.12 }}
              >
                <div style={{ marginBottom: "1.25rem" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: N, flexShrink: 0,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.9rem", fontWeight: 800, color: W,
                    boxShadow: "0 6px 18px rgba(26,58,108,0.25)",
                    fontFamily: "'DM Mono',monospace",
                  }}>
                    {i + 1}
                  </div>
                </div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: TXT, margin: "0 0 0.5rem", letterSpacing: "-0.02em" }}>{s.title}</h3>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.7, color: T2, margin: 0, fontWeight: 500, paddingRight: i < t.steps.length - 1 ? "1.5rem" : 0 }}>{s.desc}</p>
              </motion.div>
              {i < t.steps.length - 1 && (
                <div style={{
                  flexShrink: 0,
                  width: 40,
                  paddingTop: 22,   /* half of 44px = vertical centre of circle */
                  display: "flex", alignItems: "flex-start",
                }}>
                  <div style={{ width: "100%", borderTop: `2px dashed ${BDR}` }} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <motion.button
            whileHover={{ backgroundColor: N2, y: -2, boxShadow: "0 10px 30px rgba(26,58,108,0.28)" }}
            whileTap={{ scale: 0.97 }}
            onClick={onRegister}
            style={{ ...btnPrimary, padding: "13px 28px", fontSize: "0.95rem" }}
          >
            {t.howCta} <ArrowRight size={16} />
          </motion.button>
        </div>
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
                whileHover={{ scale: 1.04, borderColor: N, color: N, boxShadow: "0 4px 12px rgba(26,58,108,0.1)" }}
                key={name}
                style={{
                  borderRadius: 8, padding: "7px 16px",
                  fontSize: "0.82rem", fontWeight: 700, color: T2,
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
        style={{ padding: "3.5rem 2rem", maxWidth: 860, margin: "0 auto" }}
      >
        <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: N, letterSpacing: "0.12em", textTransform: "uppercase" }}>{t.pricingLabel}</span>
          <h2 className="tx-xl" style={{ color: TXT, margin: "0.6rem 0 0.65rem" }}>{t.pricingHeadline}</h2>
          <p style={{ fontSize: "0.975rem", color: T2, fontWeight: 500 }}>{t.pricingSubtitle}</p>
        </motion.div>

        <div className="landing-pricing-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Free */}
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -3 }}
            style={{
              background: W, borderRadius: 16, padding: "2rem",
              border: `1.5px solid ${BDR}`,
              boxShadow: "0 2px 12px rgba(26,58,108,0.04)",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div style={{ fontSize: "0.72rem", fontWeight: 800, color: T2, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>{t.freePlanLabel}</div>
            <div style={{ fontSize: "2.85rem", fontWeight: 800, letterSpacing: "-0.04em", color: TXT, lineHeight: 1, marginBottom: "0.4rem" }}>€0</div>
            <div style={{ fontSize: "0.85rem", color: T2, marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: `1px solid ${BDR}`, fontWeight: 500 }}>{t.freePlanNote}</div>
            {t.freePlanItems.map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                <CheckCircle size={14} color={GRN} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: "0.875rem", color: TXT, fontWeight: 500 }}>{f}</span>
              </div>
            ))}
            <motion.button
              whileHover={{ backgroundColor: BG, borderColor: N }}
              whileTap={{ scale: 0.98 }}
              onClick={onRegister}
              style={{ ...btnGhost, width: "100%", justifyContent: "center", marginTop: "1.5rem", padding: "12px", fontSize: "0.9rem" }}
            >
              {t.freePlanCta}
            </motion.button>
          </motion.div>

          {/* Pro */}
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -3, boxShadow: "0 24px 60px rgba(26,58,108,0.32)" }}
            style={{
              background: `linear-gradient(150deg, ${N3} 0%, ${N} 60%, #1E4A7E 100%)`,
              borderRadius: 16, padding: "2rem", position: "relative", overflow: "hidden",
              boxShadow: "0 12px 40px rgba(26,58,108,0.28)",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

            <div style={{ position: "absolute", top: 16, right: 16, background: AMB, color: "#0B0907", fontSize: "0.65rem", fontWeight: 800, padding: "3px 10px", borderRadius: 5, letterSpacing: "0.05em" }}>
              {t.proBadge}
            </div>
            <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>{t.proPlanLabel}</div>
            <div style={{ fontSize: "2.85rem", fontWeight: 800, letterSpacing: "-0.04em", color: W, lineHeight: 1, marginBottom: "0.4rem" }}>
              €29<span style={{ fontSize: "1.1rem", fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>/mo</span>
            </div>
            <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.55)", marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.12)", fontWeight: 500 }}>{t.proPlanNote}</div>
            {t.proPlanItems.map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                <CheckCircle size={14} color="#86EFAC" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.88)", fontWeight: 500 }}>{f}</span>
              </div>
            ))}
            <motion.button
              whileHover={{ opacity: 0.93, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRegister}
              style={{
                width: "100%", marginTop: "1.5rem", padding: "12px",
                background: W, color: N, border: "none", borderRadius: 10,
                fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "0.9rem",
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
            borderRadius: 12, padding: "1.1rem 1.5rem", marginTop: 14,
            display: "flex", alignItems: "flex-start", gap: 12,
            background: W, border: `1px solid ${BDR}`,
          }}
        >
          <CheckCircle size={16} color={GRN} style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: "0.875rem", color: TXT, margin: 0, lineHeight: 1.65, fontWeight: 600 }}>{t.migrationNote}</p>
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
