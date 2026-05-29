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

  const otherMethods = [
    { id: "BUNQ",    label: "bunq Transfer", icon: "🌈", desc: "Pay via bunq app" },
    { id: "REVOLUT", label: "Revolut Pay",   icon: "🌀", desc: "Pay with Revolut"  },
    { id: "MONZO",   label: "Monzo",         icon: "🏦", desc: "Pay with Monzo"    },
  ];

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
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      alert("Backend চালু নেই!\n\nTerminal এ চালাও:\ncd backend && node server.js");
    } finally {
      setIsLoading(false);
    }
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
          customerInfo: {
            name: cardName,
            address: { country: billingCountry, street: billingStreet, houseNo: billingHouse, postalCode: billingPostal, city: billingCity }
          }
        }),
      });
      const data = await res.json();
      if (data.success) { window.location.href = data.paymentUrl; }
      else { alert("Error: " + data.message); }
    } catch (err) {
      alert("Backend চালু নেই!\n\nTerminal এ চালাও:\ncd backend && node server.js");
    } finally {
      setIsLoading(false);
    }
  };

  const resetAll = () => {
    setView("main"); setAmount(""); setDescription(""); setCurrency("EUR");
    setActiveMethod(""); setCurrentOrder(null);
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

  // ✅ Visa SVG logo — correct path
  const VisaLogo = () => (
    <svg viewBox="0 0 750 237" width="30" height="10" xmlns="http://www.w3.org/2000/svg">
      <path fill="#1A1F71" d="M278.2 0L184.5 237h-62L73.4 47.6C69.8 34.3 66.7 29.7 56.3 24 39.4 14.9 11.2 6.4 0 4.1L1.4 0h99.6c12.7 0 24.1 8.4 27 23l24.7 131L278.2 0zm25.5 0L253.3 237h59L362.7 0h-59zm205 159.8c.2-57.8-79.9-61-79.4-86.8.2-7.8 7.7-16.2 24-18.3 8.1-1.1 30.5-1.9 55.8 9.8l9.9-46.4C424.6 6.5 407 0 385.4 0c-55.8 0-95 29.7-95.4 72.1-.4 31.4 28 48.9 49.3 59.3 21.9 10.7 29.3 17.5 29.2 27.1-.1 14.6-17.5 21.1-33.7 21.3-28.3.5-44.7-7.6-57.8-13.7l-10.2 47.7c13.2 6 37.4 11.3 62.5 11.5 59 0 97.6-29.1 97.9-74.5m146.6 77.2H701L651.6 0h-42.5c-9.6 0-17.7 5.6-21.3 14.1L495.4 237h59l11.7-32.4h72l6.7 32.4zm-62.8-77l29.5-81.4 17 81.4h-46.5z"/>
    </svg>
  );

  // ✅ Mastercard SVG logo
  const MastercardLogo = () => (
    <svg viewBox="0 0 38 24" width="26" height="17" xmlns="http://www.w3.org/2000/svg">
      <circle cx="15" cy="12" r="7" fill="#EB001B"/>
      <circle cx="23" cy="12" r="7" fill="#F79E1B"/>
      <path d="M19 6.8a7 7 0 0 1 0 10.4A7 7 0 0 1 19 6.8z" fill="#FF5F00"/>
    </svg>
  );

  const methodMeta = {
    BUNQ:    { label: "bunq Transfer", icon: "🌈", bg: "#1a1a3e" },
    REVOLUT: { label: "Revolut Pay",   icon: "🌀", bg: "#0a1f3e" },
    MONZO:   { label: "Monzo",         icon: "🏦", bg: "#1a2a1a" },
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center pt-10 pb-20 font-sans text-white px-4">

      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold tracking-tight">bunq</h1>
        <p className="text-[10px] tracking-widest text-gray-500 mt-1">BANK OF THE FREE</p>
      </div>

      <div className="w-full max-w-md rounded-[32px] p-[2px] bg-gradient-to-b from-[#00c97a] via-[#8a2be2] to-[#ff6b00]">
        <div className="bg-[#111111] rounded-[30px] w-full p-6 shadow-2xl">

          {/* ===== MAIN VIEW ===== */}
          {view === "main" && (
            <div className="flex flex-col">
              <div className="inline-flex items-center gap-2 bg-[#0a3f2b] text-[#00d084] px-4 py-2 rounded-full w-max mb-6 text-sm font-semibold">
                ✔ Pay securely
              </div>

              {/* Currency Toggle */}
              <div className="flex justify-center mb-5">
                <div className="flex bg-[#1a1a1a] rounded-xl p-1 border border-gray-800 w-full">
                  <button onClick={() => setCurrency("EUR")}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${currency === "EUR" ? "bg-[#ff6b00] text-white" : "text-gray-500 hover:text-gray-300"}`}>
                    🇪🇺 EUR
                  </button>
                  <button onClick={() => setCurrency("GBP")}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${currency === "GBP" ? "bg-[#8a2be2] text-white" : "text-gray-500 hover:text-gray-300"}`}>
                    🇬🇧 GBP
                  </button>
                  <button onClick={() => setCurrency("USD")}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${currency === "USD" ? "bg-[#2563eb] text-white" : "text-gray-500 hover:text-gray-300"}`}>
                    🇺🇸 USD
                  </button>
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
                {/* Women avatar SVG */}
                <div className="w-12 h-12 rounded-full bg-[#2a1a2e] flex items-center justify-center flex-shrink-0 overflow-hidden border border-[#3d2a40]">
                  <svg viewBox="0 0 48 48" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
                    {/* Background */}
                    <circle cx="24" cy="24" r="24" fill="#2a1a2e"/>
                    {/* Hair - long */}
                    <ellipse cx="24" cy="14" rx="10" ry="11" fill="#4a2040"/>
                    <rect x="14" y="14" width="4" height="18" rx="2" fill="#4a2040"/>
                    <rect x="30" y="14" width="4" height="18" rx="2" fill="#4a2040"/>
                    {/* Face */}
                    <circle cx="24" cy="17" r="8" fill="#f5c5a3"/>
                    {/* Eyes */}
                    <circle cx="21" cy="16" r="1.2" fill="#3d2010"/>
                    <circle cx="27" cy="16" r="1.2" fill="#3d2010"/>
                    {/* Smile */}
                    <path d="M21 19.5 Q24 22 27 19.5" stroke="#c97b5a" strokeWidth="1" fill="none" strokeLinecap="round"/>
                    {/* Neck */}
                    <rect x="22" y="24" width="4" height="4" fill="#f5c5a3"/>
                    {/* Body / top */}
                    <path d="M14 48 Q14 34 24 32 Q34 34 34 48Z" fill="#8a2be2"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-white text-base font-semibold">Melissa</h2>
                </div>
              </div>

              {/* ✅ Card Button with clean SVG logos */}
              <button
                disabled={!isAmountValid}
                onClick={() => handleMethodSelection("CARD")}
                className={`w-full font-bold py-4 rounded-xl mb-5 flex justify-center items-center gap-3 transition-all ${!isAmountValid ? "bg-[#1a1a1a] text-gray-600 cursor-not-allowed" : "text-white hover:opacity-90 shadow-lg"}`}
                style={{ backgroundColor: !isAmountValid ? "" : themeColor }}
              >
                <span>Pay with</span>

                {/* Visa */}
                <div className="bg-white rounded-md px-2.5 py-1.5 flex items-center justify-center shadow-sm">
                  <VisaLogo />
                </div>

                {/* Mastercard */}
                <div className="bg-[#252525] rounded-md px-2 py-1 flex items-center justify-center shadow-sm">
                  <MastercardLogo />
                </div>

                <span>Credit Card</span>
              </button>

              {/* Divider */}
              <div className="relative text-center text-xs text-gray-600 mb-3">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
                <span className="relative bg-[#111111] px-3">Other ways to pay</span>
              </div>

              {/* Other Methods */}
              <div className="flex flex-col gap-2">
                {otherMethods.map(method => (
                  <button key={method.id} disabled={!isAmountValid || isLoading}
                    onClick={() => handleMethodSelection(method.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${!isAmountValid ? "border-gray-800 bg-[#0f0f0f] opacity-40 cursor-not-allowed" : "border-gray-800 bg-[#161616] hover:bg-[#1e1e1e] hover:border-gray-600 cursor-pointer"}`}>
                    <span className="text-xl">{method.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{method.label}</div>
                      <div className="text-xs text-gray-500">{method.desc}</div>
                    </div>
                    {isLoading && activeMethod === method.id
                      ? <span className="text-xs text-blue-400 animate-pulse">Loading...</span>
                      : <span className="text-gray-600">›</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ===== CARD FORM VIEW ===== */}
          {view === "card_form" && (
            <div className="flex flex-col">
              <button onClick={() => setView("main")} className="mb-5 text-gray-400 hover:text-white text-sm flex items-center gap-2 w-max">← Back</button>
              <div className="flex items-center gap-2 mb-2"><span className="text-2xl">💳</span><span className="font-bold text-lg">Credit Card</span></div>
              <p className="text-xs text-blue-400 bg-blue-900/20 border border-blue-800/30 p-2.5 rounded-lg mb-4">
                Card details are processed securely via NowPayments.
              </p>
              <div className="text-2xl font-bold mb-5" style={{ color: themeColor }}>
                {currencySymbol}{amount}
              </div>

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
                  <input type="text" required value={cardName} onChange={e => setCardName(e.target.value)}
                    placeholder="Full name"
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
            <div className="flex flex-col">
              <button onClick={() => setView("main")} className="mb-5 text-gray-400 hover:text-white text-sm flex items-center gap-2 w-max">← Back</button>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: methodMeta[activeMethod]?.bg || "#1a1a1a" }}>
                  {methodMeta[activeMethod]?.icon}
                </div>
                <div>
                  <div className="font-semibold text-sm">{methodMeta[activeMethod]?.label}</div>
                  <div className="text-xs text-gray-500">Complete payment via NowPayments</div>
                </div>
              </div>
              <div className="text-3xl font-bold mb-6 text-center" style={{ color: themeColor }}>
                {currencySymbol}{amount}
              </div>
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
            <div className="flex flex-col items-center text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold mb-2">Payment Received!</h2>
              <p className="text-gray-400 text-sm mb-1">{currencySymbol}{amount} processed successfully</p>
              <p className="text-gray-600 text-xs mb-8">Crypto will arrive in client's wallet shortly</p>
              <button onClick={resetAll}
                className="text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg"
                style={{ background: themeColor }}>
                New Payment
              </button>
            </div>
          )}

        </div>
      </div>

      <div className="mt-6 text-center text-xs text-gray-700">
        <a href="#" className="hover:text-gray-500 mr-4">More about bunq</a>
        <a href="#" className="hover:text-gray-500">Terms & Conditions</a>
      </div>
    </div>
  );
};

export default PaymentCard;