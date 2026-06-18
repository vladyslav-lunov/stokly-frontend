import { useState } from "react";
import { Eye, EyeOff, ArrowLeft, Loader } from "lucide-react";
import type { SessionUser, UserRole } from "../types";

interface Props {
  mode: "login" | "register";
  onSuccess: (user: SessionUser) => void;
  onSwitch: () => void;
  onBack: () => void;
}

const C = { navy: "#1A3A6C", bg: "#F6F4F0", white: "#FFFFFF", txt: "#1C1F26", txt2: "#737783", bdr: "#E3E0D8" };

function Logo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect x="2"  y="2"  width="11" height="11" rx="2" fill={C.navy} />
      <rect x="15" y="2"  width="11" height="11" rx="2" fill={C.navy} opacity="0.35" />
      <rect x="2"  y="15" width="11" height="11" rx="2" fill={C.navy} opacity="0.35" />
      <rect x="15" y="15" width="11" height="11" rx="2" fill={C.navy} />
    </svg>
  );
}

const fieldWrap: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 5 };
const label: React.CSSProperties = { fontSize: "0.78rem", fontWeight: 600, color: C.txt };

function Field({ id, label: lbl, ...props }: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={fieldWrap}>
      <label htmlFor={id} style={label}>{lbl}</label>
      <input
        id={id}
        {...props}
        style={{
          background: C.white, border: `1px solid ${focused ? C.navy : C.bdr}`,
          borderRadius: 6, padding: "10px 12px",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: "0.875rem", color: C.txt, outline: "none",
          transition: "border-color 0.15s", width: "100%", boxSizing: "border-box",
        }}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
      />
    </div>
  );
}

export default function Auth({ mode, onSuccess, onSwitch, onBack }: Props) {
  const isLogin = mode === "login";
  const [form, setForm] = useState({ name: "", businessName: "", email: "", password: "", confirm: "" });
  const [role, setRole] = useState<UserRole>("OWNER");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const set = (k: keyof typeof form, v: string) => { setForm(p => ({ ...p, [k]: v })); setErr(""); };

  const validate = () => {
    if (!form.email.trim()) return "Email is required.";
    if (!form.password) return "Password is required.";
    if (!isLogin) {
      if (!form.name.trim()) return "Your name is required.";
      if (!form.businessName.trim()) return "Business name is required.";
      if (form.password.length < 8) return "Password must be at least 8 characters.";
      if (form.password !== form.confirm) return "Passwords do not match.";
    }
    return null;
  };

  const submit = () => {
    const e = validate();
    if (e) { setErr(e); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess({
        name: isLogin ? "Jan Kowalczyk" : form.name.trim(),
        email: form.email.trim(),
        businessName: isLogin ? "My Business" : form.businessName.trim(),
        role: isLogin ? "OWNER" : role,
      });
    }, 900);
  };

  const googleAuth = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess({ name: "Jan Kowalczyk", email: "jan@gmail.com", businessName: "My Business", role: "OWNER" });
    }, 700);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Left panel — navy brand */}
      <div style={{
        width: "42%", background: C.navy, padding: "3rem",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        flexShrink: 0,
      }} className="auth-panel">
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={26} />
          <span style={{ fontWeight: 700, fontSize: "1rem", color: C.white }}>Stokly</span>
        </div>

        {/* Middle content */}
        <div>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em", color: C.white, margin: "0 0 1.25rem", lineHeight: 1.2 }}>
            The inventory system for shops that grow.
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {[
              "Multi-location stock control",
              "POS and online order management",
              "Allegro & WooCommerce integration",
              "Role-based access for your team",
              "Full movement audit trail",
            ].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.75)", fontWeight: 400 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 8, padding: "1.25rem", border: "1px solid rgba(255,255,255,0.1)" }}>
          <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.85)", margin: "0 0 0.875rem", lineHeight: 1.6, fontStyle: "normal" }}>
            "Switched from spreadsheets. Our stock is finally accurate and the whole team uses it."
          </p>
          <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>Karolina W. — Café Mleczna, Kraków</div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", position: "relative" }}>
        {/* Back */}
        <button onClick={onBack} style={{
          position: "absolute", top: "1.25rem", left: "1.25rem",
          display: "flex", alignItems: "center", gap: 6,
          fontSize: "0.8rem", fontWeight: 500, color: C.txt2,
          background: "none", border: "none", cursor: "pointer",
          fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "color 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = C.txt)}
        onMouseLeave={e => (e.currentTarget.style.color = C.txt2)}>
          <ArrowLeft size={14} /> Back
        </button>

        <div style={{ width: "100%", maxWidth: 380 }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.03em", color: C.txt, margin: "0 0 0.375rem" }}>
            {isLogin ? "Sign in to Stokly" : "Create your account"}
          </h1>
          <p style={{ fontSize: "0.875rem", color: C.txt2, marginBottom: "2rem", fontWeight: 400 }}>
            {isLogin ? "Welcome back. Enter your credentials to continue." : "Get started for free. No credit card required."}
          </p>

          {/* Google */}
          <button onClick={googleAuth} disabled={loading} style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            background: C.white, border: `1px solid ${C.bdr}`, borderRadius: 6, padding: "11px",
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.875rem", fontWeight: 600, color: C.txt,
            cursor: "pointer", transition: "border-color 0.15s, box-shadow 0.15s", marginBottom: "0.75rem",
            opacity: loading ? 0.6 : 1,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = `${C.navy}50`; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.bdr; e.currentTarget.style.boxShadow = "none"; }}>
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Demo Quick Login */}
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, color: C.txt2, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center", marginBottom: "0.75rem" }}>
              ⚡ Demo — zaloguj się od razu
            </div>

            {/* Owner / Manager */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              {[
                { label: "👔 Właściciel", name: "Jan Kowalczyk", email: "jan@stokly.io", role: "OWNER" as const, color: C.navy, sub: "Pełny dostęp" },
                { label: "🗂 Manager", name: "Marta Wróbel", email: "marta@stokly.io", role: "MANAGER" as const, color: "#4A5568", sub: "Magazyn & zamówienia" },
              ].map(profile => (
                <button key={profile.role} disabled={loading} onClick={() => {
                  setLoading(true);
                  setTimeout(() => {
                    setLoading(false);
                    onSuccess({ name: profile.name, email: profile.email, businessName: "Demo Stokly", role: profile.role });
                  }, 400);
                }} style={{
                  background: `${profile.color}0d`, border: `1.5px solid ${profile.color}30`,
                  borderRadius: 8, padding: "9px 8px", cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.72rem", fontWeight: 700,
                  color: profile.color, textAlign: "center", lineHeight: 1.45,
                  transition: "background 0.15s, border-color 0.15s",
                  opacity: loading ? 0.6 : 1,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${profile.color}1a`; e.currentTarget.style.borderColor = profile.color; }}
                onMouseLeave={e => { e.currentTarget.style.background = `${profile.color}0d`; e.currentTarget.style.borderColor = `${profile.color}30`; }}>
                  {profile.label}<br />
                  <span style={{ fontSize: "0.64rem", fontWeight: 500, opacity: 0.65 }}>{profile.sub}</span>
                </button>
              ))}
            </div>

            {/* Staff login — prominent card */}
            <div style={{
              background: "linear-gradient(135deg, #f0f7f2 0%, #e8f4ed 100%)",
              border: "1.5px solid #BEE0CB",
              borderRadius: 10,
              padding: "14px 14px 12px",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{ position: "absolute", right: -16, top: -16, width: 80, height: 80, borderRadius: "50%", background: "rgba(46,125,79,0.07)", pointerEvents: "none" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#2E7D4F", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1A5C35" }}>📦 Logowanie Pracownika</div>
                  <div style={{ fontSize: "0.67rem", color: "#276749", fontWeight: 500 }}>POS · przyjęcia towaru · skaner QR</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {[
                  { name: "Ewa Białek", pin: "1234", loc: "Krakow Store" },
                  { name: "Tomasz Lewandowski", pin: "5678", loc: "Warsaw Flagship" },
                ].map(worker => (
                  <button key={worker.name} disabled={loading} onClick={() => {
                    setLoading(true);
                    setTimeout(() => {
                      setLoading(false);
                      onSuccess({ name: worker.name, email: worker.name.toLowerCase().replace(" ", ".") + "@stokly.io", businessName: "Demo Stokly", role: "STAFF" });
                    }, 400);
                  }} style={{
                    background: "rgba(255,255,255,0.8)", border: "1px solid #BEE0CB",
                    borderRadius: 7, padding: "9px 10px", cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    textAlign: "left", lineHeight: 1.35,
                    transition: "background 0.15s, border-color 0.15s, box-shadow 0.15s",
                    opacity: loading ? 0.6 : 1,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#2E7D4F"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(46,125,79,0.14)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.8)"; e.currentTarget.style.borderColor = "#BEE0CB"; e.currentTarget.style.boxShadow = "none"; }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#1A5C35" }}>{worker.name.split(" ")[0]}</div>
                    <div style={{ fontSize: "0.65rem", color: "#276749", fontWeight: 500 }}>{worker.loc}</div>
                    <div style={{ fontSize: "0.6rem", color: "#276749", fontFamily: "'DM Mono', monospace", marginTop: 3, opacity: 0.55 }}>PIN: {worker.pin}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>


          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <div style={{ flex: 1, height: 1, background: C.bdr }} />
            <span style={{ fontSize: "0.75rem", color: C.txt2, fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: 1, background: C.bdr }} />
          </div>

          {/* Error */}
          {err && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 6, padding: "10px 12px", marginBottom: "1rem" }}>
              <p style={{ fontSize: "0.82rem", color: "#DC2626", margin: 0, fontWeight: 500 }}>{err}</p>
            </div>
          )}

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }} onKeyDown={e => e.key === "Enter" && submit()}>
            {!isLogin && <>
              <Field id="name" label="Full name" placeholder="Jan Kowalczyk" value={form.name} onChange={e => set("name", e.target.value)} />
              <Field id="biz" label="Business name" placeholder="My Shop Ltd." value={form.businessName} onChange={e => set("businessName", e.target.value)} />
              {/* Role selector */}
              <div style={fieldWrap}>
                <label style={label}>Your role in this business</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["OWNER", "MANAGER", "STAFF"] as UserRole[]).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      style={{
                        flex: 1, padding: "8px 4px",
                        background: role === r ? C.navy : C.white,
                        color: role === r ? C.white : C.txt2,
                        border: `1px solid ${role === r ? C.navy : C.bdr}`,
                        borderRadius: 6, fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {r === "OWNER" ? "👑 Owner" : r === "MANAGER" ? "🧑‍💼 Manager" : "👤 Staff"}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: "0.72rem", color: C.txt2, margin: "4px 0 0" }}>
                  {role === "OWNER" ? "Full access to all features" : role === "MANAGER" ? "Manage stock, orders and locations" : "POS, receive goods and QR scanning"}
                </p>
              </div>
            </>}
            <Field id="email" label="Email address" type="email" placeholder="you@company.com" value={form.email} onChange={e => set("email", e.target.value)} />

            {/* Password */}
            <div style={fieldWrap}>
              <label htmlFor="pw" style={label}>Password</label>
              <div style={{ position: "relative" }}>
                <input id="pw" type={showPw ? "text" : "password"} placeholder={isLogin ? "Your password" : "Min. 8 characters"}
                  value={form.password} onChange={e => set("password", e.target.value)}
                  style={{
                    background: C.white, border: `1px solid ${C.bdr}`, borderRadius: 6,
                    padding: "10px 40px 10px 12px", width: "100%", boxSizing: "border-box",
                    fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.875rem", color: C.txt, outline: "none",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = C.navy)}
                  onBlur={e => (e.currentTarget.style.borderColor = C.bdr)}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: C.txt2, display: "flex",
                  padding: 2, transition: "color 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = C.txt)}
                onMouseLeave={e => (e.currentTarget.style.color = C.txt2)}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <Field id="confirm" label="Confirm password" type="password" placeholder="Repeat password" value={form.confirm} onChange={e => set("confirm", e.target.value)} />
            )}
          </div>

          {isLogin && (
            <div style={{ textAlign: "right", marginTop: "0.5rem" }}>
              <button style={{ fontSize: "0.8rem", color: C.navy, background: "none", border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 500, transition: "opacity 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit */}
          <button onClick={submit} disabled={loading} style={{
            width: "100%", marginTop: "1.5rem", padding: "12px",
            background: C.navy, color: C.white, border: "none", borderRadius: 6,
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.9rem",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "background 0.15s, opacity 0.15s",
            opacity: loading ? 0.7 : 1,
          }}
          onMouseEnter={e => !loading && (e.currentTarget.style.background = "#1E4585")}
          onMouseLeave={e => (e.currentTarget.style.background = C.navy)}>
            {loading
              ? <><Loader size={14} style={{ animation: "spin 1s linear infinite" }} /> {isLogin ? "Signing in…" : "Creating account…"}</>
              : isLogin ? "Sign in" : "Create account"}
          </button>

          <p style={{ fontSize: "0.82rem", color: C.txt2, textAlign: "center", marginTop: "1.25rem" }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={onSwitch} style={{ color: C.navy, fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: "0.82rem", transition: "opacity 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
              {isLogin ? "Sign up free" : "Sign in"}
            </button>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .auth-panel { display: none !important; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
