import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

const PaymentCard = () => {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [description, setDescription] = useState("");
  const [view, setView] = useState("main");
  const [activeMethod, setActiveMethod] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showOtherMethods, setShowOtherMethods] = useState(false);
  const [cardName, setCardName] = useState("");
  const [billingCountry, setBillingCountry] = useState("United Kingdom");
  const [billingStreet, setBillingStreet] = useState("");
  const [billingHouse, setBillingHouse] = useState("");
  const [billingPostal, setBillingPostal] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const pollRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const currencySymbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : "€";
  const themeColor = currency === "USD" ? "#2563eb" : currency === "GBP" ? "#8a2be2" : "#ff6b00";

  const countries = [
    "Netherlands","Belgium","Germany","France","United Kingdom","United States",
    "Bangladesh","India","Pakistan","Australia","Austria","Brazil","Canada",
    "China","Denmark","Egypt","Finland","Ghana","Greece","Hungary","Iceland",
    "Indonesia","Iran","Iraq","Ireland","Israel","Italy","Japan","Jordan",
    "Kazakhstan","Kenya","Kuwait","Latvia","Lebanon","Luxembourg","Malaysia",
    "Malta","Mexico","Morocco","Myanmar","Nepal","New Zealand","Nigeria",
    "Norway","Oman","Panama","Peru","Philippines","Poland","Portugal","Qatar",
    "Romania","Russia","Saudi Arabia","Serbia","Singapore","Slovakia","Slovenia",
    "South Africa","South Korea","Spain","Sri Lanka","Sweden","Switzerland",
    "Taiwan","Tanzania","Thailand","Turkey","Ukraine","United Arab Emirates",
    "Uruguay","Vietnam","Yemen","Zambia","Zimbabwe"
  ];

  useEffect(() => {
    if (currentOrder?.orderId && view === "qr_view") {
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/api/order/${currentOrder.orderId}`);
          const data = await res.json();
          if (data.success && data.status === "completed") {
            clearInterval(pollRef.current);
            setView("success");
          }
        } catch (err) {}
      }, 5000);
    }
    return () => clearInterval(pollRef.current);
  }, [currentOrder, view, API_BASE]);

  const handleMethodSelection = async (methodId) => {
    setActiveMethod(methodId);
    if (methodId === "CARD") { setView("card_form"); return; }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/pay/nowpayments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), currency, method: methodId }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentOrder({ orderId: data.orderId, paymentUrl: data.paymentUrl });
        setView("qr_view");
      } else { alert("Error: " + data.message); }
    } catch (err) {
      alert("Backend চালু নেই!\n\nTerminal এ চালাও:\ncd backend && node server.js");
    } finally { setIsLoading(false); }
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/pay/nowpayments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount), currency, method: "CARD",
          customerInfo: { name: cardName, address: { country: billingCountry, street: billingStreet, houseNo: billingHouse, postalCode: billingPostal, city: billingCity } }
        }),
      });
      const data = await res.json();
      if (data.success) { window.location.href = data.paymentUrl; }
      else { alert("Error: " + data.message); }
    } catch (err) {
      alert("Backend চালু নেই!\n\nTerminal এ চালাও:\ncd backend && node server.js");
    } finally { setIsLoading(false); }
  };

  const resetAll = () => {
    setView("main"); setAmount(""); setDescription(""); setCurrency("EUR");
    setActiveMethod(""); setCurrentOrder(null); setShowOtherMethods(false);
    setCardName(""); setBillingStreet(""); setBillingHouse("");
    setBillingPostal(""); setBillingCity(""); setBillingCountry("United Kingdom");
  };

  const isAmountValid = amount && Number(amount) > 0;

  const QrTimer = () => {
    const [secs, setSecs] = useState(899);
    useEffect(() => {
      const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
      return () => clearInterval(t);
    }, []);
    const m = Math.floor(secs / 60), s = secs % 60;
    return (
      <p className={`text-xs mt-3 text-center ${secs === 0 ? "text-red-400" : "text-gray-400"}`}>
        {secs === 0 ? "QR expired. Go back and try again." : `Valid for ${m}:${s.toString().padStart(2, "0")}`}
      </p>
    );
  };

  // ✅ Visa — clean text-based logo like real card
  const VisaLogo = () => (
    <svg viewBox="0 0 60 20" width="36" height="12" xmlns="http://www.w3.org/2000/svg">
      <text x="2" y="16" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="900" fontStyle="italic" fill="#1A1F71" letterSpacing="-1">VISA</text>
    </svg>
  );

  // ✅ Mastercard circles logo
  const MastercardLogo = () => (
    <svg viewBox="0 0 38 24" width="28" height="18" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="12" r="8" fill="#EB001B"/>
      <circle cx="24" cy="12" r="8" fill="#F79E1B"/>
      <path d="M19 5.5a8 8 0 0 1 0 13A8 8 0 0 1 19 5.5z" fill="#FF5F00"/>
    </svg>
  );

  // ✅ bunq official logo (colourful squares)
  const BunqLogo = () => (
    <svg viewBox="0 0 32 32" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#1a1a2e"/>
      <rect x="4"  y="4"  width="10" height="10" rx="2" fill="#00d084"/>
      <rect x="18" y="4"  width="10" height="10" rx="2" fill="#8a2be2"/>
      <rect x="4"  y="18" width="10" height="10" rx="2" fill="#ff6b00"/>
      <rect x="18" y="18" width="10" height="10" rx="2" fill="#00aaff"/>
    </svg>
  );

  // ✅ Revolut official logo (stylized R)
  const RevolutLogo = () => (
    <svg viewBox="0 0 32 32" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#0a0a0a"/>
      <text x="5" y="24" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="900" fill="white">R</text>
      <rect x="16" y="14" width="10" height="3" rx="1.5" fill="white" transform="rotate(40 16 14)"/>
    </svg>
  );

  // ✅ Monzo official logo (coral M)
  const MonzoLogo = () => (
    <svg viewBox="0 0 32 32" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#ff3464"/>
      <text x="3" y="24" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="900" fill="white">M</text>
    </svg>
  );

  const otherMethods = [
    { id: "BUNQ",    label: "bunq",    desc: "Pay via bunq app",   Logo: BunqLogo    },
    { id: "REVOLUT", label: "Revolut", desc: "Pay with Revolut",   Logo: RevolutLogo },
    { id: "MONZO",   label: "Monzo",   desc: "Pay with Monzo",     Logo: MonzoLogo   },
  ];

  const methodMeta = {
    BUNQ:    { label: "bunq Transfer", Logo: BunqLogo,    bg: "#1a1a3e" },
    REVOLUT: { label: "Revolut Pay",   Logo: RevolutLogo, bg: "#0a0a0a" },
    MONZO:   { label: "Monzo",         Logo: MonzoLogo,   bg: "#ff3464" },
  };

  // ✅ Animated rotating border gradient
  const borderStyle = {
    background: "linear-gradient(#111111, #111111) padding-box, linear-gradient(var(--angle, 0deg), #00c97a, #8a2be2, #ff6b00, #00aaff, #00c97a) border-box",
    border: "3px solid transparent",
    borderRadius: "30px",
    animation: "rotateBorder 3s linear infinite",
  };

  return (
    <>
      <style>{`
        @keyframes rotateBorder {
          to { --angle: 360deg; }
        }
        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-down { animation: fadeDown 0.2s ease; }
      `}</style>

      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center pt-10 pb-20 font-sans text-white px-4">

        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold tracking-tight">bunq</h1>
          <p className="text-[10px] tracking-widest text-gray-500 mt-1">BANK OF THE FREE</p>
        </div>

        {/* ✅ Animated rotating border */}
        <div className="w-full max-w-md" style={borderStyle}>

          {/* ===== MAIN VIEW ===== */}
          {view === "main" && (
            <div className="p-6">
              <div className="inline-flex items-center gap-2 bg-[#0a3f2b] text-[#00d084] px-4 py-2 rounded-full w-max mb-6 text-sm font-semibold">
                ✔ Pay securely
              </div>

              {/* Currency Toggle */}
              <div className="flex justify-center mb-5">
                <div className="flex bg-[#1a1a1a] rounded-xl p-1 border border-gray-800 w-full">
                  {[["EUR","#ff6b00","🇪🇺"],["GBP","#8a2be2","🇬🇧"],["USD","#2563eb","🇺🇸"]].map(([c, col, flag]) => (
                    <button key={c} onClick={() => setCurrency(c)}
                      className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                      style={{ background: currency === c ? col : "transparent", color: currency === c ? "#fff" : "#888" }}>
                      {flag} {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-[#1f1500] rounded-xl flex items-center justify-center text-lg flex-shrink-0">💰</div>
                <input value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Add a description"
                  className="bg-transparent outline-none text-gray-400 placeholder-gray-600 text-sm flex-1 focus:text-white" />
              </div>

              {/* Amount */}
              <div className="flex items-baseline font-bold text-5xl mb-8" style={{ color: themeColor }}>
                <span>{currencySymbol}</span>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="0" min="0.01" step="0.01"
                  className="bg-transparent outline-none w-full ml-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{ color: themeColor }} />
              </div>

              {/* Recipient */}
              <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-800">
                <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden border border-[#3d2a40]">
                  <svg viewBox="0 0 48 48" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="24" fill="#2a1a2e"/>
                    <ellipse cx="24" cy="14" rx="10" ry="11" fill="#4a2040"/>
                    <rect x="14" y="14" width="4" height="18" rx="2" fill="#4a2040"/>
                    <rect x="30" y="14" width="4" height="18" rx="2" fill="#4a2040"/>
                    <circle cx="24" cy="17" r="8" fill="#f5c5a3"/>
                    <circle cx="21" cy="16" r="1.2" fill="#3d2010"/>
                    <circle cx="27" cy="16" r="1.2" fill="#3d2010"/>
                    <path d="M21 19.5 Q24 22 27 19.5" stroke="#c97b5a" strokeWidth="1" fill="none" strokeLinecap="round"/>
                    <rect x="22" y="24" width="4" height="4" fill="#f5c5a3"/>
                    <path d="M14 48 Q14 34 24 32 Q34 34 34 48Z" fill="#8a2be2"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-white text-base font-semibold">Melissa</h2>
                </div>
              </div>

              {/* ✅ Card Button */}
              <button disabled={!isAmountValid} onClick={() => handleMethodSelection("CARD")}
                className={`w-full font-bold py-4 rounded-xl mb-4 flex justify-center items-center gap-3 transition-all ${!isAmountValid ? "bg-[#1a1a1a] text-gray-600 cursor-not-allowed" : "text-white hover:opacity-90 shadow-lg"}`}
                style={{ backgroundColor: !isAmountValid ? "" : themeColor }}>
                <span>Pay with</span>
                {/* Visa badge */}
                <div className="bg-white rounded-md px-2 py-1 flex items-center justify-center h-7">
                  <VisaLogo />
                </div>
                {/* Mastercard badge */}
                <div className="bg-[#1a1a1a] border border-gray-700 rounded-md px-1.5 py-1 flex items-center justify-center h-7">
                  <MastercardLogo />
                </div>
                <span>Credit Card</span>
              </button>

              {/* ✅ Other ways to pay — centered dropdown trigger, no button style */}
              <div
                onClick={() => isAmountValid && setShowOtherMethods(p => !p)}
                className={`flex flex-col items-center justify-center py-3 mb-1 select-none ${!isAmountValid ? "opacity-30 cursor-not-allowed" : "cursor-pointer group"}`}>
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-1 h-px bg-gray-800"></div>
                  <span className="text-base font-semibold text-gray-300 hover:text-white transition-colors tracking-wide whitespace-nowrap">
                    Other ways to pay
                  </span>
                  <div className="flex-1 h-px bg-gray-800"></div>
                </div>
                <span
                  className="text-gray-500 text-xs mt-1.5 transition-transform duration-300"
                  style={{ display: "inline-block", transform: showOtherMethods ? "rotate(180deg)" : "rotate(0deg)" }}>
                  ▼
                </span>
              </div>

              {/* ✅ Dropdown methods — only show when toggled */}
              {showOtherMethods && isAmountValid && (
                <div className="flex flex-col gap-2 mt-2 fade-down">
                  {otherMethods.map(({ id, label, desc, Logo }) => (
                    <button key={id} disabled={isLoading}
                      onClick={() => handleMethodSelection(id)}
                      className="flex items-center gap-3 p-4 rounded-xl border border-gray-800 bg-[#161616] hover:bg-[#1e1e1e] hover:border-gray-600 transition-all text-left cursor-pointer">
                      {/* Official logo */}
                      <div className="flex-shrink-0">
                        <Logo />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{label}</div>
                        <div className="text-xs text-gray-500">{desc}</div>
                      </div>
                      {isLoading && activeMethod === id
                        ? <span className="text-xs text-blue-400 animate-pulse">Loading...</span>
                        : <span className="text-gray-600">›</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== CARD FORM VIEW ===== */}
          {view === "card_form" && (
            <div className="p-6 flex flex-col">
              <button onClick={() => setView("main")} className="mb-5 text-gray-400 hover:text-white text-sm flex items-center gap-2 w-max">← Back</button>
              <div className="flex items-center gap-2 mb-2"><span className="text-2xl">💳</span><span className="font-bold text-lg">Credit Card</span></div>
              <p className="text-xs text-blue-400 bg-blue-900/20 border border-blue-800/30 p-2.5 rounded-lg mb-4">Card details are processed securely via NowPayments.</p>
              <div className="text-2xl font-bold mb-5" style={{ color: themeColor }}>{currencySymbol}{amount}</div>
              <form onSubmit={handleCardSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Card number</label>
                  <input type="text" required placeholder="1234 5678 9012 3456" maxLength={19}
                    className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 font-mono text-sm" />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 mb-1.5 block">Expiry (MM/YY)</label>
                    <input type="text" required placeholder="MM/YY" maxLength={5}
                      className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 text-sm" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 mb-1.5 block">CVV</label>
                    <input type="text" required placeholder="123" maxLength={4}
                      className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Name on card</label>
                  <input type="text" required value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Full name"
                    className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 text-sm" />
                </div>
                <div className="border-t border-gray-800 pt-4">
                  <p className="text-sm font-bold text-gray-300 mb-3">Billing address</p>
                  <div className="mb-3">
                    <label className="text-xs text-gray-400 mb-1.5 block">Country/Region</label>
                    <select value={billingCountry} onChange={e => setBillingCountry(e.target.value)}
                      className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl p-3 text-white outline-none text-sm cursor-pointer">
                      {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-3 mb-3">
                    <div className="flex-[2]">
                      <label className="text-xs text-gray-400 mb-1.5 block">Street</label>
                      <input type="text" required value={billingStreet} onChange={e => setBillingStreet(e.target.value)}
                        className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl p-3 text-white outline-none text-sm" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 mb-1.5 block">House no.</label>
                      <input type="text" required value={billingHouse} onChange={e => setBillingHouse(e.target.value)}
                        className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl p-3 text-white outline-none text-sm" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 mb-1.5 block">Postal code</label>
                      <input type="text" required value={billingPostal} onChange={e => setBillingPostal(e.target.value)}
                        className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl p-3 text-white outline-none text-sm" />
                    </div>
                    <div className="flex-[2]">
                      <label className="text-xs text-gray-400 mb-1.5 block">City</label>
                      <input type="text" required value={billingCity} onChange={e => setBillingCity(e.target.value)}
                        className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl p-3 text-white outline-none text-sm" />
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={isLoading}
                  className="w-full text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-2"
                  style={{ background: themeColor }}>
                  {isLoading ? "Redirecting securely..." : `🔒 Pay ${currencySymbol}${amount}`}
                </button>
              </form>
            </div>
          )}

          {/* ===== QR VIEW ===== */}
          {view === "qr_view" && currentOrder && (
            <div className="p-6 flex flex-col">
              <button onClick={() => setView("main")} className="mb-5 text-gray-400 hover:text-white text-sm flex items-center gap-2 w-max">← Back</button>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: methodMeta[activeMethod]?.bg || "#1a1a1a" }}>
                  {methodMeta[activeMethod] && (() => { const L = methodMeta[activeMethod].Logo; return <L />; })()}
                </div>
                <div>
                  <div className="font-semibold text-sm">{methodMeta[activeMethod]?.label}</div>
                  <div className="text-xs text-gray-500">Complete payment via NowPayments</div>
                </div>
              </div>
              <div className="text-3xl font-bold mb-6 text-center" style={{ color: themeColor }}>{currencySymbol}{amount}</div>
              <div className="flex flex-col items-center bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
                <p className="text-xs text-gray-400 mb-4 text-center">Scan QR or click button below:</p>
                <div className="bg-white p-4 rounded-xl mb-4">
                  <QRCodeSVG value={currentOrder.paymentUrl} size={180} />
                </div>
                <button onClick={() => window.open(currentOrder.paymentUrl, "_blank")}
                  className="w-full bg-[#ff6b00] text-white font-bold py-3 px-6 rounded-xl text-sm hover:bg-[#e06000] transition-all">
                  Click here to Pay Securely →
                </button>
                <QrTimer />
              </div>
              <div className="flex items-center gap-2 justify-center mt-5 text-xs text-gray-500">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                Waiting for payment confirmation...
              </div>
            </div>
          )}

          {/* ===== SUCCESS VIEW ===== */}
          {view === "success" && (
            <div className="p-6 flex flex-col items-center text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold mb-2">Payment Received!</h2>
              <p className="text-gray-400 text-sm mb-1">{currencySymbol}{amount} processed successfully</p>
              <p className="text-gray-600 text-xs mb-8">Crypto will arrive in client's wallet shortly</p>
              <button onClick={resetAll} className="text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg" style={{ background: themeColor }}>
                New Payment
              </button>
            </div>
          )}

        </div>

      </div>
    </>
  );
};

export default PaymentCard;