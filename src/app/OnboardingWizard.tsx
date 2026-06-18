import { useState } from "react";
import { ArrowRight, Check, Loader, Store, MapPin } from "lucide-react";
import type { SessionUser } from "../types";

interface Props {
  user: SessionUser;
  onComplete: (shopName: string, shopAddress: string) => void;
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

function Field({ id, label, ...props }: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={fieldWrap}>
      <label htmlFor={id} style={{ fontSize: "0.78rem", fontWeight: 600, color: C.txt }}>{label}</label>
      <input id={id} {...props}
        style={{
          background: C.white, border: `1px solid ${focused ? C.navy : C.bdr}`,
          borderRadius: 6, padding: "10px 12px", outline: "none",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: "0.875rem", color: C.txt,
          transition: "border-color 0.15s", width: "100%", boxSizing: "border-box" as const,
        }}
        onFocus={e => { setFocused(true); props.onFocus?.(e); }}
        onBlur={e => { setFocused(false); props.onBlur?.(e); }}
      />
    </div>
  );
}

export default function OnboardingWizard({ user, onComplete }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [shopName, setShopName] = useState(user.businessName ? `${user.businessName} — Main Shop` : "");
  const [shopAddress, setShopAddress] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const next = () => {
    if (step === 1) { setStep(2); return; }
    if (!shopName.trim()) { setErr("Shop name is required."); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onComplete(shopName.trim(), shopAddress.trim());
    }, 900);
  };

  const steps = [
    { n: 1, label: "Account" },
    { n: 2, label: "First shop" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.txt, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>

      <div style={{ width: "100%", maxWidth: 520 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: "2.5rem" }}>
          <Logo size={26} />
          <span style={{ fontWeight: 700, fontSize: "1rem", color: C.txt }}>Stokly</span>
        </div>

        {/* Step indicators */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: s.n < step ? C.navy : s.n === step ? C.navy : C.bdr,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.3s",
                }}>
                  {s.n < step
                    ? <Check size={13} color={C.white} />
                    : <span style={{ fontSize: "0.72rem", fontWeight: 700, color: s.n === step ? C.white : C.txt2 }}>{s.n}</span>
                  }
                </div>
                <span style={{ fontSize: "0.82rem", fontWeight: s.n === step ? 600 : 400, color: s.n === step ? C.txt : C.txt2 }}>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ width: 48, height: 1, background: step > s.n ? C.navy : C.bdr, transition: "background 0.4s", margin: "0 4px" }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{ background: C.white, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "2.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>

          {step === 1 ? (
            /* ── Step 1: Account confirmed ── */
            <div>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.03em", color: C.txt, margin: "0 0 0.5rem" }}>
                Welcome, {user.name.split(" ")[0]}!
              </h1>
              <p style={{ fontSize: "0.875rem", color: C.txt2, margin: "0 0 2rem", lineHeight: 1.6 }}>
                Your account has been created. One more step and you're ready to go.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
                <div style={{ border: `1px solid ${C.bdr}`, borderRadius: 8, padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "0.72rem", fontWeight: 600, color: C.txt2, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Account owner</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: C.txt }}>{user.name}</div>
                    <div style={{ fontSize: "0.82rem", color: C.txt2 }}>{user.email}</div>
                  </div>
                  <div style={{ width: 40, height: 40, background: "#EDF0F7", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: C.navy }}>
                    {user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                </div>
                <div style={{ border: `1px solid ${C.bdr}`, borderRadius: 8, padding: "1rem 1.25rem" }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 600, color: C.txt2, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Business</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: C.txt }}>{user.businessName}</div>
                  <div style={{ fontSize: "0.82rem", color: C.txt2 }}>Owner · Full access</div>
                </div>
              </div>

              <div style={{ background: "#EDF0F7", borderRadius: 8, padding: "1rem 1.25rem", display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 32, height: 32, background: C.navy, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <Store size={15} color={C.white} />
                </div>
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: C.txt }}>Next: set up your first shop location</div>
                  <div style={{ fontSize: "0.8rem", color: C.txt2, marginTop: 2 }}>Just a name and address — takes 30 seconds.</div>
                </div>
              </div>
            </div>

          ) : (
            /* ── Step 2: First shop ── */
            <div>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.03em", color: C.txt, margin: "0 0 0.5rem" }}>
                Create your first shop
              </h1>
              <p style={{ fontSize: "0.875rem", color: C.txt2, margin: "0 0 2rem", lineHeight: 1.6 }}>
                This becomes your main shop location. You can rename it or add more locations after setup.
              </p>

              {err && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 6, padding: "10px 12px", marginBottom: "1.25rem" }}>
                  <p style={{ fontSize: "0.82rem", color: "#DC2626", margin: 0, fontWeight: 500 }}>{err}</p>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.75rem" }}>
                <Field
                  id="shopName" label="Shop name *"
                  placeholder="e.g. Main Street Shop"
                  value={shopName}
                  onChange={e => { setShopName(e.target.value); setErr(""); }}
                />
                <Field
                  id="shopAddr" label="Address (optional)"
                  placeholder="e.g. ul. Nowy Świat 14, Warsaw"
                  value={shopAddress}
                  onChange={e => setShopAddress(e.target.value)}
                />
              </div>

              <div style={{ background: C.bg, border: `1px solid ${C.bdr}`, borderRadius: 6, padding: "0.875rem 1rem", display: "flex", gap: 10 }}>
                <MapPin size={14} color={C.txt2} style={{ marginTop: 1, flexShrink: 0 }} />
                <p style={{ fontSize: "0.8rem", color: C.txt2, margin: 0, lineHeight: 1.6 }}>
                  Stock will be tracked at this shop. Add a warehouse location later from the Locations screen if needed.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.25rem" }}>
          {step > 1 ? (
            <button onClick={() => { setStep(1); setErr(""); }} style={{
              fontSize: "0.85rem", fontWeight: 500, color: C.txt2,
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans',sans-serif",
              transition: "color 0.15s", padding: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = C.txt)}
            onMouseLeave={e => (e.currentTarget.style.color = C.txt2)}>
              ← Back
            </button>
          ) : <div />}

          <button onClick={next} disabled={loading} style={{
            background: C.navy, color: C.white, border: "none", borderRadius: 6,
            padding: "11px 24px", fontFamily: "'Plus Jakarta Sans',sans-serif",
            fontWeight: 700, fontSize: "0.875rem",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
            transition: "background 0.15s", opacity: loading ? 0.7 : 1,
          }}
          onMouseEnter={e => !loading && (e.currentTarget.style.background = "#1E4585")}
          onMouseLeave={e => (e.currentTarget.style.background = C.navy)}>
            {loading
              ? <><Loader size={14} style={{ animation: "spin 1s linear infinite" }} /> Setting up…</>
              : step === 1
              ? <>Continue <ArrowRight size={14} /></>
              : <>Go to dashboard <ArrowRight size={14} /></>
            }
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
