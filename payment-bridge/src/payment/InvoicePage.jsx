// ─── src/components/payment/InvoicePage.jsx ─────────────────────────────────
// C1 · Invoice page
// Props:
//   onProceed({ total, currency }) — called when user clicks "Pay"
//
// Backend hook (Step 13):
//   GET /api/invoice/:id → replace hardcoded `services` with fetched data
//   GET /api/rates       → replace EUR_TO_USD constant with live rate

import { useState } from "react";
import { convert, fmt } from "../utils/format";
// import { fmt, convert } from "../../utils/format";

// ─── Shared inline styles ────────────────────────────────────────────────────
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
    padding: "24px 28px 20px",
  },
  body: { padding: "24px 28px 28px" },
  label: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase",
    marginBottom: 10,
  },
  primaryBtn: {
    width: "100%",
    padding: "15px",
    background: "#f97316",
    border: "none",
    borderRadius: 12,
    color: "#fff",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    transition: "opacity .15s",
  },
};

// ─── Hardcoded service data (Step 13-এ API থেকে আসবে) ──────────────────────
const DEFAULT_SERVICES = [
  { id: 1, name: "Web Development",   desc: "Full-stack React + Node.js",    amount: 350 },
  { id: 2, name: "UI/UX Design",      desc: "Figma mockups & prototypes",    amount: 120 },
  { id: 3, name: "SEO Setup",         desc: "On-page + technical audit",     amount: 75  },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function InvoicePage({ onProceed }) {
  const [currency, setCurrency] = useState("USD");
  const [services]              = useState(DEFAULT_SERVICES);
  const [hoverBtn, setHoverBtn] = useState(false);

  // Base amounts are in USD; convert to EUR when needed
  const totalUSD  = services.reduce((sum, s) => sum + s.amount, 0);
  const total     = currency === "USD" ? totalUSD : convert(totalUSD, "USD", "EUR");

  return (
    <div style={S.page}>
      <div style={S.card}>

        {/* ── Header ── */}
        <div style={S.header}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>

            {/* Merchant identity */}
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{
                width:40, height:40, borderRadius:"50%",
                background:"linear-gradient(135deg,#f97316,#ef4444)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:14, fontWeight:700, color:"#fff",
              }}>
                SK
              </div>
              <div>
                <div style={{ color:"#fff", fontSize:15, fontWeight:600 }}>Suranjit Kumar</div>
                <div style={{ color:"rgba(255,255,255,0.35)", fontSize:12, marginTop:1 }}>
                  Invoice #INV-2026-001
                </div>
              </div>
            </div>

            {/* Currency toggle */}
            <div style={{ display:"flex", background:"rgba(255,255,255,0.07)", borderRadius:8, padding:3 }}>
              {["USD","EUR"].map(c => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  style={{
                    padding:"5px 16px", border:"none", borderRadius:6,
                    fontSize:13, fontWeight:600, cursor:"pointer",
                    background: currency === c ? "rgba(255,255,255,0.15)" : "transparent",
                    color:      currency === c ? "#fff" : "rgba(255,255,255,0.4)",
                    transition: "all .2s",
                  }}
                >{c}</button>
              ))}
            </div>
          </div>

          {/* Total amount */}
          <div style={{ fontSize:36, fontWeight:700, color:"#fff", letterSpacing:-1 }}>
            {fmt(total, currency)}
          </div>
          <div style={{ color:"rgba(255,255,255,0.35)", fontSize:12, marginTop:4 }}>
            Due immediately · {new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}
          </div>
        </div>

        {/* ── Body ── */}
        <div style={S.body}>
          <div style={S.label}>Services</div>

          {/* Line items */}
          {services.map((service, i) => (
            <div
              key={service.id}
              style={{
                display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"13px 0",
                borderBottom: i < services.length - 1
                  ? "1px solid rgba(255,255,255,0.05)"
                  : "none",
              }}
            >
              <div>
                <div style={{ color:"#fff", fontSize:14, fontWeight:500 }}>{service.name}</div>
                <div style={{ color:"rgba(255,255,255,0.38)", fontSize:12, marginTop:2 }}>{service.desc}</div>
              </div>
              <div style={{ color:"#f97316", fontSize:14, fontWeight:600 }}>
                {fmt(convert(service.amount, "USD", currency), currency)}
              </div>
            </div>
          ))}

          {/* Total row */}
          <div style={{
            display:"flex", justifyContent:"space-between", alignItems:"center",
            padding:"16px 0 20px",
            borderTop:"1px solid rgba(255,255,255,0.1)",
          }}>
            <span style={{ color:"rgba(255,255,255,0.5)", fontSize:13 }}>Total</span>
            <span style={{ color:"#fff", fontSize:22, fontWeight:700 }}>{fmt(total, currency)}</span>
          </div>

          {/* Crypto info banner */}
          <div style={{
            background:"rgba(249,115,22,0.07)",
            border:"1px solid rgba(249,115,22,0.18)",
            borderRadius:10, padding:"10px 14px", marginBottom:20,
            fontSize:12, color:"rgba(255,255,255,0.45)",
          }}>
            <span style={{ color:"#f97316", fontWeight:600 }}>Payment auto-converts to USDT</span>
            {" "}— your customer pays by card, you receive crypto directly.
          </div>

          {/* Pay button */}
          <button
            style={{ ...S.primaryBtn, opacity: hoverBtn ? 0.88 : 1 }}
            onMouseEnter={() => setHoverBtn(true)}
            onMouseLeave={() => setHoverBtn(false)}
            onClick={() => onProceed({ total, currency })}
          >
            Pay {fmt(total, currency)} →
          </button>

          <div style={{ textAlign:"center", marginTop:14, fontSize:11, color:"rgba(255,255,255,0.22)" }}>
            Secured by bunq · Funds settle as USDT to your crypto wallet
          </div>
        </div>
      </div>
    </div>
  );
}