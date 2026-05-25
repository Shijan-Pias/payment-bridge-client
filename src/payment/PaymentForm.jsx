// ─── src/components/payment/PaymentForm.jsx ─────────────────────────────────
// C2 · Payment card form
// Props:
//   amount   {number}   — total to charge
//   currency {string}   — "USD" | "EUR"
//   onBack   {function} — go back to invoice
//   onCharge {function} — called with paymentId on success
//
// Backend hook (Step 13):
//   POST /api/payment/charge  → { paymentId }
//   Replace the demo setTimeout with the real fetch call below.

import { useState } from "react";
import { detectCardType, fmt, fmtCard, fmtExpiry } from "../utils/format";
// import { fmt, fmtCard, fmtExpiry, detectCardType } from "../../utils/format";

// ─── Shared styles ────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: "100vh",
    background: "#0c0c0e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    fontFamily: "'Inter','Segoe UI',sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 480,
    background: "#141416",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    overflow: "hidden",
  },
  header: {
    background: "#0a0a0b",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    padding: "22px 28px 18px",
  },
  body: { padding: "22px 28px 28px" },
  label: {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase",
    marginBottom: 7,
  },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  primaryBtn: {
    width: "100%",
    padding: "14px",
    background: "#f97316",
    border: "none",
    borderRadius: 12,
    color: "#fff",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "opacity .15s",
  },
};

// Dynamic input style — highlights orange on focus
function inputStyle(focused) {
  return {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${focused ? "rgba(249,115,22,0.6)" : "rgba(255,255,255,0.1)"}`,
    borderRadius: 10,
    padding: "11px 13px",
    fontSize: 14,
    color: "#fff",
    outline: "none",
    boxSizing: "border-box",
    transition: "border .15s",
  };
}

const COUNTRIES = [
  "Bangladesh","United States","United Kingdom",
  "Netherlands","Germany","France","India","Australia",
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function PaymentForm({ amount, currency, onBack, onCharge }) {
  // Card fields
  const [cardNumber, setCardNumber] = useState("");
  const [expiry,     setExpiry]     = useState("");
  const [cvv,        setCvv]        = useState("");
  const [name,       setName]       = useState("");

  // Billing address fields
  const [country,  setCountry]  = useState("");
  const [street,   setStreet]   = useState("");
  const [houseNo,  setHouseNo]  = useState("");
  const [postal,   setPostal]   = useState("");
  const [city,     setCity]     = useState("");

  // UI state
  const [focused,  setFocused]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const cardType = detectCardType(cardNumber);

  // ── Submit handler ──────────────────────────────────────────────────────────
  async function handleSubmit() {
    // Basic validation
    if (!cardNumber || !expiry || !cvv || !name) {
      setError("Please fill in all card details.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      // ── BACKEND HOOK (Step 13) ──────────────────────────────────────────────
      // Uncomment this block and remove the demo setTimeout below:
      //
      // const res = await fetch("/api/payment/charge", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     cardNumber,
      //     expiry,
      //     cvv,
      //     name,
      //     amount,
      //     currency,
      //     billingAddress: { country, street, houseNo, postal, city },
      //   }),
      // });
      // if (!res.ok) throw new Error("Payment failed");
      // const { paymentId } = await res.json();
      // onCharge(paymentId);
      // ────────────────────────────────────────────────────────────────────────

      // Demo: simulate API delay
      await new Promise(r => setTimeout(r, 1800));
      onCharge("PAY-DEMO-" + Date.now());

    } catch (err) {
      setError("Payment failed. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      <div style={S.card}>

        {/* ── Header ── */}
        <div style={S.header}>
          {/* Secure badge */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <div style={{
              width:24, height:24, borderRadius:"50%",
              background:"rgba(74,222,128,0.15)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:12, color:"#4ade80", fontWeight:700,
            }}>✓</div>
            <span style={{ color:"#4ade80", fontSize:12, fontWeight:600 }}>Pay securely</span>
          </div>

          {/* Amount */}
          <div style={{ fontSize:30, fontWeight:700, color:"#fff", letterSpacing:-1 }}>
            {fmt(amount, currency)}
          </div>

          {/* Merchant */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:10 }}>
            <div style={{
              width:32, height:32, borderRadius:"50%",
              background:"linear-gradient(135deg,#f97316,#ef4444)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:12, fontWeight:700, color:"#fff",
            }}>SK</div>
            <div>
              <div style={{ color:"#fff", fontSize:13, fontWeight:500 }}>Suranjit Kumar</div>
              <div style={{ color:"rgba(255,255,255,0.3)", fontSize:11, fontFamily:"monospace" }}>
                NL94 BUNQ 2160 6315 66
              </div>
            </div>
          </div>

          {/* Back link */}
          <button
            onClick={onBack}
            style={{ marginTop:12, background:"none", border:"none",
              color:"rgba(255,255,255,0.38)", fontSize:12, cursor:"pointer", padding:0 }}
          >
            ← Back to invoice
          </button>
        </div>

        {/* ── Body ── */}
        <div style={S.body}>
          <div style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.65)", marginBottom:16 }}>
            💳 Credit / Debit card
          </div>

          {/* Card number */}
          <div style={{ marginBottom:14 }}>
            <label style={S.label}>Card number</label>
            <div style={{ position:"relative" }}>
              <input
                style={{ ...inputStyle(focused==="card"), paddingRight:60 }}
                value={cardNumber}
                onChange={e => setCardNumber(fmtCard(e.target.value))}
                onFocus={() => setFocused("card")}
                onBlur={() => setFocused(null)}
                placeholder="0000 0000 0000 0000"
                maxLength={19}
              />
              {/* Card type badge */}
              <span style={{
                position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                fontSize:10, fontWeight:700,
                color: cardType==="VISA" ? "#3b82f6"
                     : cardType==="MC"   ? "#ef4444"
                     : "rgba(255,255,255,0.3)",
              }}>
                {cardType}
              </span>
            </div>
            {/* Accepted networks */}
            <div style={{ display:"flex", gap:6, marginTop:6 }}>
              {["MC","VISA","AMEX","GP"].map(n => (
                <span key={n} style={{
                  background:"rgba(255,255,255,0.05)",
                  border:"1px solid rgba(255,255,255,0.1)",
                  borderRadius:4, padding:"2px 8px",
                  fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.4)",
                }}>{n}</span>
              ))}
            </div>
          </div>

          {/* Expiry + CVV */}
          <div style={{ ...S.row2, marginBottom:14 }}>
            <div>
              <label style={S.label}>Expiry date</label>
              <input
                style={inputStyle(focused==="exp")}
                value={expiry}
                onChange={e => setExpiry(fmtExpiry(e.target.value))}
                onFocus={() => setFocused("exp")}
                onBlur={() => setFocused(null)}
                placeholder="MM / YY"
                maxLength={7}
              />
            </div>
            <div>
              <label style={S.label}>Security code</label>
              <input
                style={inputStyle(focused==="cvv")}
                value={cvv}
                onChange={e => setCvv(e.target.value.replace(/\D/g,"").slice(0,4))}
                onFocus={() => setFocused("cvv")}
                onBlur={() => setFocused(null)}
                placeholder="CVV"
                maxLength={4}
                type="password"
              />
            </div>
          </div>

          {/* Name */}
          <div style={{ marginBottom:20 }}>
            <label style={S.label}>Name on card</label>
            <input
              style={inputStyle(focused==="name")}
              value={name}
              onChange={e => setName(e.target.value)}
              onFocus={() => setFocused("name")}
              onBlur={() => setFocused(null)}
              placeholder="Full name"
            />
          </div>

          {/* ── Billing address ── */}
          <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:16, marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.65)", marginBottom:14 }}>
              Billing address
            </div>

            {/* Country */}
            <div style={{ marginBottom:12 }}>
              <label style={S.label}>Country / Region</label>
              <select
                style={{ ...inputStyle(focused==="country"), appearance:"none" }}
                value={country}
                onChange={e => setCountry(e.target.value)}
                onFocus={() => setFocused("country")}
                onBlur={() => setFocused(null)}
              >
                <option value="">Select country</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Street + House */}
            <div style={{ ...S.row2, marginBottom:12 }}>
              <div>
                <label style={S.label}>Street</label>
                <input
                  style={inputStyle(focused==="street")}
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  onFocus={() => setFocused("street")}
                  onBlur={() => setFocused(null)}
                  placeholder="Street name"
                />
              </div>
              <div>
                <label style={S.label}>House no.</label>
                <input
                  style={inputStyle(focused==="house")}
                  value={houseNo}
                  onChange={e => setHouseNo(e.target.value)}
                  onFocus={() => setFocused("house")}
                  onBlur={() => setFocused(null)}
                  placeholder="No."
                />
              </div>
            </div>

            {/* Postal + City */}
            <div style={S.row2}>
              <div>
                <label style={S.label}>Postal code</label>
                <input
                  style={inputStyle(focused==="postal")}
                  value={postal}
                  onChange={e => setPostal(e.target.value)}
                  onFocus={() => setFocused("postal")}
                  onBlur={() => setFocused(null)}
                  placeholder="12345"
                />
              </div>
              <div>
                <label style={S.label}>City</label>
                <input
                  style={inputStyle(focused==="city")}
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  onFocus={() => setFocused("city")}
                  onBlur={() => setFocused(null)}
                  placeholder="City"
                />
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              background:"rgba(239,68,68,0.1)",
              border:"1px solid rgba(239,68,68,0.3)",
              borderRadius:8, padding:"10px 14px", marginBottom:14,
              color:"#f87171", fontSize:13,
            }}>
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            style={{ ...S.primaryBtn, opacity: loading ? 0.7 : 1, cursor: loading ? "wait" : "pointer" }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <span>⟳ Processing…</span>
              : <span>🔒 Pay {fmt(amount, currency)}</span>
            }
          </button>

          <div style={{ textAlign:"center", marginTop:12, fontSize:11, color:"rgba(255,255,255,0.2)" }}>
            Protected by Google reCAPTCHA · Powered by bunq
          </div>
        </div>
      </div>
    </div>
  );
}