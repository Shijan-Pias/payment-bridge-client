// ─── src/components/payment/SuccessScreen.jsx ───────────────────────────────
// C4 · Success screen — receipt with TX hash and USDT confirmation
// Props:
//   paymentId    {string}   — payment reference
//   amount       {number}   — amount charged
//   currency     {string}   — "USD" | "EUR"
//   onNewPayment {function} — reset and start over
//
// Backend hook (Step 13):
//   GET /api/payment/receipt?paymentId=xxx
//   → { txHash, usdt, network, wallet, fee, date }
//   Replace the hardcoded `receipt` object below with fetched data.

import { useState, useEffect } from "react";
import { fmt } from "../utils/format";
// import { fmt } from "../../utils/format";

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
    padding: "32px 28px 24px",
    textAlign: "center",
  },
  body: { padding: "24px 28px 28px" },
  btn: {
    flex: 1,
    padding: "13px",
    border: "none",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity .15s",
  },
};

export default function SuccessScreen({ paymentId, amount, currency, onNewPayment }) {
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    // ── BACKEND HOOK (Step 13) ────────────────────────────────────────────────
    // fetch(`/api/payment/receipt?paymentId=${paymentId}`)
    //   .then(r => r.json())
    //   .then(data => setReceipt(data))
    //   .catch(console.error);
    // ─────────────────────────────────────────────────────────────────────────

    // Demo: fake receipt data
    setReceipt({
      usdt:    (amount * 0.997).toFixed(2),
      txHash:  "0x3fa8d1c9b7e2" + Math.random().toString(36).slice(2, 10),
      network: "TRC-20 (TRON)",
      wallet:  "TRx9Kq...mN8",
      fee:     (amount * 0.003).toFixed(2),
      date:    new Date().toLocaleString("en-GB"),
    });
  }, [paymentId]);

  if (!receipt) {
    return (
      <div style={{ ...S.page }}>
        <div style={{ color:"rgba(255,255,255,0.4)", fontSize:14 }}>Loading receipt…</div>
      </div>
    );
  }

  const rows = [
    ["Amount paid",   fmt(amount, currency)],
    ["USDT received", `${receipt.usdt} USDT`],
    ["Network",       receipt.network],
    ["To wallet",     receipt.wallet],
    ["Fee",           fmt(receipt.fee, currency)],
    ["Date",          receipt.date],
  ];

  return (
    <div style={S.page}>
      <div style={S.card}>

        {/* ── Header ── */}
        <div style={S.header}>
          <div style={{
            width:72, height:72,
            background:"rgba(74,222,128,0.08)",
            border:"2px solid rgba(74,222,128,0.28)",
            borderRadius:"50%",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:32, color:"#4ade80",
            margin:"0 auto 16px",
          }}>✓</div>
          <div style={{ color:"#4ade80", fontSize:22, fontWeight:700 }}>
            Payment successful!
          </div>
          <div style={{ color:"rgba(255,255,255,0.38)", fontSize:13, marginTop:6 }}>
            USDT has been sent to your wallet
          </div>
        </div>

        {/* ── Body ── */}
        <div style={S.body}>

          {/* TX Hash block */}
          <div style={{
            background:"rgba(249,115,22,0.07)",
            border:"1px solid rgba(249,115,22,0.16)",
            borderRadius:10, padding:"12px 14px", marginBottom:20,
          }}>
            <div style={{
              fontSize:10, fontWeight:600, letterSpacing:"0.05em",
              textTransform:"uppercase", color:"rgba(255,255,255,0.3)", marginBottom:5,
            }}>
              Transaction hash
            </div>
            <div style={{
              fontFamily:"monospace", fontSize:13, color:"#f97316", wordBreak:"break-all",
            }}>
              {receipt.txHash}
            </div>
          </div>

          {/* Receipt rows */}
          <div>
            {rows.map(([key, value], i) => (
              <div key={key} style={{
                display:"flex", justifyContent:"space-between",
                padding:"11px 0",
                borderBottom: i < rows.length - 1
                  ? "1px solid rgba(255,255,255,0.05)"
                  : "none",
              }}>
                <span style={{ fontSize:13, color:"rgba(255,255,255,0.38)" }}>{key}</span>
                <span style={{ fontSize:13, color:"#fff", fontWeight:500 }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display:"flex", gap:10, marginTop:24 }}>
            <button
              style={{ ...S.btn, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", color:"#fff" }}
              onClick={() => {
                // TODO Step 13: generate and download PDF receipt
                alert("PDF download — connect to /api/payment/receipt/pdf?paymentId=" + paymentId);
              }}
            >
              Download PDF
            </button>
            <button
              style={{ ...S.btn, background:"#f97316", color:"#fff" }}
              onClick={onNewPayment}
            >
              New payment
            </button>
          </div>

          <div style={{ textAlign:"center", marginTop:14, fontSize:11, color:"rgba(255,255,255,0.2)" }}>
            Payment ID: {paymentId}
          </div>
        </div>
      </div>
    </div>
  );
}