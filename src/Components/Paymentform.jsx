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
  const [billingCountry, setBillingCountry] = useState("Netherlands");
  const [billingStreet, setBillingStreet] = useState("");
  const [billingHouse, setBillingHouse] = useState("");
  const [billingPostal, setBillingPostal] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const pollRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const currencySymbol = currency === "USD" ? "$" : "€";

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

  // ✅ Payment status polling - NowPayments payment হলে success দেখাবে
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

  // ✅ bunq/Revolut/Monzo → NowPayments invoice → QR দেখাবে
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

  // ✅ Card submit → NowPayments invoice → redirect
  const handleCardSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/pay/nowpayments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          currency,
          method: "CARD",
          customerInfo: {
            name: cardName,
            address: {
              country: billingCountry,
              street: billingStreet,
              houseNo: billingHouse,
              postalCode: billingPostal,
              city: billingCity,
            }
          }
        }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = data.paymentUrl;
      } else {
        alert("Error: " + data.message);
      }
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
    setBillingPostal(""); setBillingCity(""); setBillingCountry("Netherlands");
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

  const methodMeta = {
    BUNQ:    { label: "bunq Transfer", icon: "🌈", bg: "#1a1a3e" },
    REVOLUT: { label: "Revolut Pay",   icon: "🌀", bg: "#0a1f3e" },
    MONZO:   { label: "Monzo",         icon: "🏦", bg: "#1a2a1a" },
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center pt-10 pb-20 font-sans text-white px-4">

      {/* Logo */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold tracking-tight">bunq</h1>
        <p className="text-[10px] tracking-widest text-gray-500 mt-1">BANK OF THE FREE</p>
      </div>

      {/* Gradient border card */}
      <div className="w-full max-w-md rounded-[32px] p-[2px] bg-gradient-to-b from-[#00c97a] via-[#8a2be2] to-[#ff6b00]">
        <div className="bg-[#111111] rounded-[30px] w-full p-6 shadow-2xl">

          {/* ===== MAIN VIEW ===== */}
          {view === "main" && (
            <div className="flex flex-col">
              <div className="inline-flex items-center gap-2 bg-[#0a3f2b] text-[#00d084] px-4 py-2 rounded-full w-max mb-6 text-sm font-semibold">
                ✔ Pay securely
              </div>

              {/* Currency toggle */}
              <div className="flex justify-center mb-5">
                <div className="flex bg-[#1a1a1a] rounded-xl p-1 border border-gray-800">
                  <button onClick={() => setCurrency("EUR")}
                    className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${currency === "EUR" ? "bg-[#ff6b00] text-white" : "text-gray-500 hover:text-gray-300"}`}>
                    🇪🇺 EUR
                  </button>
                  <button onClick={() => setCurrency("USD")}
                    className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${currency === "USD" ? "bg-[#2563eb] text-white" : "text-gray-500 hover:text-gray-300"}`}>
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
              <div className="flex items-baseline font-bold text-5xl mb-8" style={{ color: currency === "USD" ? "#2563eb" : "#ff6b00" }}>
                <span>{currencySymbol}</span>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="0" min="0.01" step="0.01"
                  className="bg-transparent outline-none w-full ml-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{ color: currency === "USD" ? "#2563eb" : "#ff6b00" }} />
              </div>

              {/* Recipient */}
              <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-800">
                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-bold text-lg flex-shrink-0">SK</div>
                <div>
                  <h2 className="text-white text-base font-semibold">Suranjit Kumar</h2>
                  <p className="text-gray-500 text-xs font-mono">NL94 BUNQ 2160 6315 66</p>
                </div>
              </div>

              {/* Card button */}
              <button disabled={!isAmountValid} onClick={() => handleMethodSelection("CARD")}
                className={`w-full font-bold py-4 rounded-xl mb-5 flex justify-center items-center gap-2 transition-all ${!isAmountValid ? "bg-[#1a1a1a] text-gray-600 cursor-not-allowed" : "bg-[#2563eb] hover:bg-[#1d4ed8] text-white"}`}>
                Pay with
                <span className="bg-white text-black text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  VISA <span className="text-[#eb001b]">MC</span>
                </span>
                Credit Card
              </button>

              {/* Divider */}
              <div className="relative text-center text-xs text-gray-600 mb-3">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
                <span className="relative bg-[#111111] px-3">Other ways to pay</span>
              </div>

              {/* Other methods */}
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
              <button onClick={() => setView("main")} className="mb-5 text-gray-400 hover:text-white text-sm flex items-center gap-2">← Back</button>
              <div className="flex items-center gap-2 mb-2"><span className="text-2xl">💳</span><span className="font-bold text-lg">Credit Card</span></div>
              <p className="text-xs text-blue-400 bg-blue-900/20 border border-blue-800/30 p-2.5 rounded-lg mb-4">
                Card details are processed securely via NowPayments.
              </p>
              <div className="text-2xl font-bold mb-5" style={{ color: currency === "USD" ? "#2563eb" : "#ff6b00" }}>
                {currencySymbol}{amount}
              </div>

              <form onSubmit={handleCardSubmit} className="flex flex-col gap-4">
                {/* Card number - visual only, actual payment on NowPayments page */}
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

                {/* Name - saved to DB */}
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Name on card</label>
                  <input type="text" required value={cardName} onChange={e => setCardName(e.target.value)}
                    placeholder="Full name"
                    className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 text-sm" />
                </div>

                {/* Billing address - saved to DB */}
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
                  className="w-full text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: currency === "USD" ? "#2563eb" : "#ff6b00" }}>
                  {isLoading ? "Redirecting securely..." : `🔒 Pay ${currencySymbol}${amount}`}
                </button>
              </form>
            </div>
          )}

          {/* ===== QR VIEW ===== */}
          {view === "qr_view" && currentOrder && (
            <div className="flex flex-col">
              <button onClick={() => setView("main")} className="mb-5 text-gray-400 hover:text-white text-sm flex items-center gap-2">← Back</button>
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

              <div className="text-3xl font-bold mb-6 text-center" style={{ color: currency === "USD" ? "#2563eb" : "#ff6b00" }}>
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
                className="text-white font-bold py-3 px-8 rounded-xl transition-all"
                style={{ background: currency === "USD" ? "#2563eb" : "#ff6b00" }}>
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