// ─── src/components/payment/ProcessingScreen.jsx ────────────────────────────
// C3 · Processing screen — live 4-step status tracker
// Props:
//   paymentId {string}   — from PaymentForm onCharge
//   onDone    {function} — called when status === "done"
//
// Backend hook (Step 13):
//   Replace the demo timers with real polling:
//   GET /api/payment/status?paymentId=xxx → { status: "paid"|"converting"|"sending"|"done" }

import { useState, useEffect } from "react";

// ─── Step definitions ─────────────────────────────────────────────────────────
const STEPS = [
  {
    key:   "paid",
    label: "Payment confirmed",
    sub:   "Card charged successfully",
  },
  {
    key:   "converting",
    label: "Converting to USDT",
    sub:   "USD / EUR → USDT via exchange API",
  },
  {
    key:   "sending",
    label: "Sending to wallet",
    sub:   "Broadcasting on TRC-20 network",
  },
  {
    key:   "done",
    label: "USDT delivered",
    sub:   "Funds arrived in your wallet",
  },
];

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
    padding: "40px 32px",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProcessingScreen({ paymentId, onDone }) {
  const [stepIndex, setStepIndex] = useState(0); // which step is active
  const [dots,      setDots]      = useState(".");

  // ── Polling / demo timer ──────────────────────────────────────────────────
  useEffect(() => {
    // ── BACKEND HOOK (Step 13) ────────────────────────────────────────────────
    // Replace the demo timers with real polling:
    //
    // const STATUS_ORDER = ["paid", "converting", "sending", "done"];
    //
    // const poll = setInterval(async () => {
    //   try {
    //     const res  = await fetch(`/api/payment/status?paymentId=${paymentId}`);
    //     const data = await res.json();
    //     const idx  = STATUS_ORDER.indexOf(data.status);
    //     if (idx >= 0) setStepIndex(idx);
    //     if (data.status === "done") {
    //       clearInterval(poll);
    //       setTimeout(onDone, 1600);
    //     }
    //   } catch (err) {
    //     console.error("Status poll failed:", err);
    //   }
    // }, 2500);
    //
    // return () => clearInterval(poll);
    // ─────────────────────────────────────────────────────────────────────────

    // Demo: advance through steps automatically
    const timers = STEPS.map((_, i) =>
      setTimeout(() => {
        setStepIndex(i);
        if (i === STEPS.length - 1) {
          setTimeout(onDone, 1800);
        }
      }, i * 2200)
    );
    return () => timers.forEach(clearTimeout);
  }, [paymentId]);

  // Animated dots for "Processing…"
  useEffect(() => {
    const t = setInterval(
      () => setDots(d => d.length >= 3 ? "." : d + "."),
      500
    );
    return () => clearInterval(t);
  }, []);

  const isDone = stepIndex === STEPS.length - 1;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      <div style={S.card}>

        {/* ── Spinner / check ── */}
        <div style={{ textAlign:"center", marginBottom:36 }}>
          {isDone ? (
            <div style={{
              width:64, height:64,
              background:"rgba(74,222,128,0.1)",
              border:"2px solid rgba(74,222,128,0.35)",
              borderRadius:"50%",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:28, color:"#4ade80",
              margin:"0 auto 16px",
            }}>✓</div>
          ) : (
            <div style={{
              width:64, height:64,
              border:"3px solid rgba(255,255,255,0.07)",
              borderTop:"3px solid #f97316",
              borderRadius:"50%",
              margin:"0 auto 16px",
              animation:"spin 1s linear infinite",
            }} />
          )}

          <div style={{ color:"#fff", fontSize:18, fontWeight:700 }}>
            {isDone ? "Complete!" : `Processing${dots}`}
          </div>
          <div style={{ color:"rgba(255,255,255,0.3)", fontSize:12, marginTop:4, fontFamily:"monospace" }}>
            {paymentId}
          </div>
        </div>

        {/* ── Steps ── */}
        <div style={{ display:"flex", flexDirection:"column" }}>
          {STEPS.map((step, i) => {
            const done   = i < stepIndex;
            const active = i === stepIndex;

            return (
              <div key={step.key} style={{ display:"flex", gap:14, position:"relative" }}>
                {/* Connector line between dots */}
                {i < STEPS.length - 1 && (
                  <div style={{
                    position:"absolute", left:15, top:32, width:2, height:32,
                    background: done ? "#4ade80" : "rgba(255,255,255,0.08)",
                    transition:"background .4s",
                  }} />
                )}

                {/* Step dot */}
                <div style={{
                  width:32, height:32, borderRadius:"50%", flexShrink:0,
                  border:`2px solid ${done ? "#4ade80" : active ? "#f97316" : "rgba(255,255,255,0.12)"}`,
                  background: done   ? "rgba(74,222,128,0.15)"
                             : active ? "rgba(249,115,22,0.12)"
                             : "transparent",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:12, fontWeight:700, transition:"all .4s",
                  color: done   ? "#4ade80"
                       : active ? "#f97316"
                       : "rgba(255,255,255,0.2)",
                }}>
                  {done ? "✓" : i + 1}
                </div>

                {/* Step label */}
                <div style={{ paddingBottom:28 }}>
                  <div style={{
                    fontSize:14, fontWeight:600,
                    color: done || active ? "#fff" : "rgba(255,255,255,0.25)",
                    transition:"color .4s",
                  }}>
                    {step.label}
                  </div>
                  <div style={{
                    fontSize:12,
                    color: done || active ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)",
                    marginTop:2, transition:"color .4s",
                  }}>
                    {step.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CSS keyframe for spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}