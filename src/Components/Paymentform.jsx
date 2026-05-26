import { useState, useEffect, useRef } from "react";
import QRCode from "react-qr-code";

const PaymentCard = () => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [view, setView] = useState("main");
  const [activeMethod, setActiveMethod] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const pollRef = useRef(null);

  // ✅ FIX 1: API_BASE এখন সঠিকভাবে define করা
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const otherMethods = [
    { id: "BUNQ",       label: "From a bunq account", icon: "🌈", desc: "Scan QR with bunq app" },
    { id: "IDEAL",      label: "iDEAL | Wero",        icon: "🟣", desc: "Dutch bank transfer"  },
    { id: "BANCONTACT", label: "Bancontact",           icon: "🔵", desc: "Belgian payment"      },
  ];

  const countries = [
    "Netherlands","Belgium","Germany","France","United Kingdom","United States",
    "Bangladesh","India","Pakistan","Afghanistan","Albania","Algeria","Andorra",
    "Angola","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas",
    "Bahrain","Barbados","Belarus","Belize","Benin","Bhutan","Bolivia","Brazil",
    "Brunei","Bulgaria","Cambodia","Cameroon","Canada","Chile","China","Colombia",
    "Croatia","Cuba","Cyprus","Czechia","Denmark","Ecuador","Egypt","Estonia",
    "Ethiopia","Fiji","Finland","Gabon","Georgia","Ghana","Greece","Guatemala",
    "Hungary","Iceland","Indonesia","Iran","Iraq","Ireland","Israel","Italy",
    "Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Latvia","Lebanon",
    "Lithuania","Luxembourg","Malaysia","Malta","Mexico","Moldova","Monaco",
    "Mongolia","Morocco","Myanmar","Nepal","New Zealand","Nigeria","Norway",
    "Oman","Panama","Peru","Philippines","Poland","Portugal","Qatar","Romania",
    "Russia","Saudi Arabia","Serbia","Singapore","Slovakia","Slovenia",
    "South Africa","South Korea","Spain","Sri Lanka","Sweden","Switzerland",
    "Taiwan","Tanzania","Thailand","Turkey","Ukraine","United Arab Emirates",
    "Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
  ];

  // Payment Status Polling (bunq payment হলে detect করতে)
  useEffect(() => {
    if (currentOrder?.orderId && view === "qr_view") {
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/api/order/${currentOrder.orderId}`);
          const data = await res.json();
          if (data.status === "completed") {
            clearInterval(pollRef.current);
            setPaymentStatus("completed");
            setView("success");
          }
        } catch (err) { /* ignore network errors */ }
      }, 5000);
    }
    return () => clearInterval(pollRef.current);
  }, [currentOrder, view, API_BASE]);

  // Method Selection Handler
  const handleMethodSelection = async (methodId) => {
    setActiveMethod(methodId);
    if (methodId === "CARD") {
      setView("card_form");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/pay/bunq`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), method: methodId }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentOrder({ orderId: data.orderId, paymentUrl: data.paymentUrl });
        setView("qr_view");
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      alert("Backend connect হচ্ছে না। নিচের checklist দেখো:\n\n1. backend folder এ npm install করেছ?\n2. node server.js চালু আছে?\n3. .env file আছে?");
    } finally {
      setIsLoading(false);
    }
  };

  // Card Form Submit → NowPayments Invoice
  const handleCardSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/pay/nowpayments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), method: "CARD" }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = data.paymentUrl;
      } else {
        alert("Payment error: " + data.message);
      }
    } catch (err) {
      alert("Backend connect হচ্ছে না। নিচের checklist দেখো:\n\n1. backend folder এ npm install করেছ?\n2. node server.js চালু আছে?\n3. .env file এ NOWPAYMENTS_API_KEY আছে?");
    } finally {
      setIsLoading(false);
    }
  };

  const resetAll = () => {
    setView("main"); setAmount(""); setDescription("");
    setActiveMethod(""); setCurrentOrder(null); setPaymentStatus(null);
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
      <p className={`text-xs mt-2 ${secs === 0 ? "text-red-400" : "text-gray-400"}`}>
        {secs === 0 ? "QR code expired. Please go back." : `This QR code is valid for ${m}:${s.toString().padStart(2,"0")}`}
      </p>
    );
  };

  const methodLabels = {
    BUNQ:       { label: "bunq Transfer",  icon: "🌈", color: "#1a1a3e" },
    IDEAL:      { label: "iDEAL | Wero",   icon: "🟣", color: "#3d0050" },
    BANCONTACT: { label: "Bancontact",     icon: "🔵", color: "#001a3e" },
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center pt-10 pb-20 font-sans text-white px-4">

      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold tracking-tight">bunq</h1>
        <p className="text-[10px] tracking-widest text-gray-500 mt-1">BANK OF THE FREE</p>
      </div>

      <div className="w-full max-w-md rounded-[32px] p-[2px] bg-gradient-to-b from-[#00c97a] via-[#8a2be2] to-[#ff6b00]">
        <div className="bg-[#111111] rounded-[30px] w-full p-6 shadow-2xl">

          {/* MAIN VIEW */}
          {view === "main" && (
            <div className="flex flex-col">
              <div className="inline-flex items-center gap-2 bg-[#0a3f2b] text-[#00d084] px-4 py-2 rounded-full w-max mb-6 text-sm font-semibold">
                ✔ Pay securely
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-[#1f1500] rounded-xl flex items-center justify-center text-lg flex-shrink-0">💰</div>
                <input value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Add a description"
                  className="bg-transparent outline-none text-gray-400 placeholder-gray-600 text-sm flex-1 focus:text-white" />
              </div>
              <div className="flex items-baseline text-[#ff6b00] font-bold text-5xl mb-8">
                <span>€</span>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  className="bg-transparent outline-none w-full ml-2 placeholder-[#5a3a10] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0" min="0.01" step="0.01" />
              </div>
              <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-800">
                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-bold text-lg flex-shrink-0">SK</div>
                <div>
                  <h2 className="text-white text-base font-semibold">Suranjit Kumar</h2>
                  <p className="text-gray-500 text-xs font-mono">NL94 BUNQ 2160 6315 66</p>
                </div>
              </div>
              <button disabled={!isAmountValid} onClick={() => handleMethodSelection("CARD")}
                className={`w-full font-bold py-4 rounded-xl mb-5 flex justify-center items-center gap-2 transition-all ${
                  !isAmountValid ? "bg-[#1a1a1a] text-gray-600 cursor-not-allowed" : "bg-[#2563eb] hover:bg-[#1d4ed8] text-white"}`}>
                Pay with
                <span className="bg-white text-black text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  VISA <span className="text-[#eb001b]">MC</span>
                </span>
                Credit Card
              </button>
              <div className="text-center text-gray-500 text-xs mb-3 relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
                <span className="relative bg-[#111111] px-3">Other ways to pay</span>
              </div>
              <div className="flex flex-col gap-2">
                {otherMethods.map(method => (
                  <button key={method.id} disabled={!isAmountValid || isLoading}
                    onClick={() => handleMethodSelection(method.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                      !isAmountValid ? "border-gray-800 bg-[#0f0f0f] opacity-40 cursor-not-allowed"
                                     : "border-gray-800 bg-[#161616] hover:bg-[#1e1e1e] hover:border-gray-600 cursor-pointer"}`}>
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

          {/* CARD FORM VIEW */}
          {view === "card_form" && (
            <div className="flex flex-col">
              <button onClick={() => setView("main")} className="mb-5 flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium">← Back</button>
              <div className="flex items-center gap-2 mb-2"><span className="text-2xl">💳</span><span className="font-bold text-lg">Credit Card</span></div>
              <p className="text-xs text-blue-400 bg-blue-900/20 border border-blue-800/30 p-2.5 rounded-lg mb-5">All fields are required unless marked otherwise.</p>
              <div className="text-2xl font-bold text-[#ff6b00] mb-5">€{amount}</div>
              <form onSubmit={handleCardSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Card number</label>
                  <input type="text" required placeholder="1234 5678 9012 3456" maxLength={19}
                    className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 font-mono text-sm" />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 mb-1.5 block">Expiry date</label>
                    <input type="text" required placeholder="MM/YY" maxLength={5}
                      className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 text-sm" />
                    <p className="text-[10px] text-gray-600 mt-1">Front of card MM/YY</p>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-400 mb-1.5 block">Security code</label>
                    <input type="text" required placeholder="CVV" maxLength={4}
                      className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 text-sm" />
                    <p className="text-[10px] text-gray-600 mt-1">3 digits on back</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Name on card</label>
                  <input type="text" required placeholder="Full name"
                    className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 text-sm" />
                </div>
                <div className="border-t border-gray-800 pt-4">
                  <h3 className="font-bold text-sm mb-3 text-gray-300">Billing address</h3>
                  <div className="mb-3">
                    <label className="text-xs text-gray-400 mb-1.5 block">Country/Region</label>
                    <select defaultValue="Netherlands"
                      className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 text-sm cursor-pointer">
                      {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-3 mb-3">
                    <div className="flex-[2]">
                      <label className="text-xs text-gray-400 mb-1.5 block">Street</label>
                      <input type="text" required className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 text-sm" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 mb-1.5 block">House no.</label>
                      <input type="text" required className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 text-sm" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 mb-1.5 block">Postal code</label>
                      <input type="text" required className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 text-sm" />
                    </div>
                    <div className="flex-[2]">
                      <label className="text-xs text-gray-400 mb-1.5 block">City</label>
                      <input type="text" required className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 text-sm" />
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={isLoading}
                  className="w-full bg-[#ff6b00] text-white font-bold py-4 rounded-xl mt-2 hover:bg-[#e06000] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? "Processing..." : `🔒 Pay €${amount}`}
                </button>
              </form>
            </div>
          )}

          {/* QR VIEW */}
          {view === "qr_view" && currentOrder && (
            <div className="flex flex-col">
              <button onClick={() => setView("main")} className="mb-5 flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium">← Back</button>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: methodLabels[activeMethod]?.color || '#1a1a1a' }}>
                  {methodLabels[activeMethod]?.icon}
                </div>
                <div>
                  <div className="font-semibold text-sm">{methodLabels[activeMethod]?.label}</div>
                  <div className="text-xs text-gray-500">Scan to pay</div>
                </div>
              </div>
              <div className="text-3xl font-bold text-[#ff6b00] mb-6 text-center">€{amount}</div>
              <div className="flex flex-col items-center bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
                <p className="text-xs text-gray-400 mb-4">Scan this QR to continue:</p>
                <div className="bg-white p-4 rounded-xl">
                  <QRCode value={currentOrder.paymentUrl} size={180} />
                </div>
                <QrTimer />
              </div>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 border-t border-gray-800"></div>
                <span className="text-xs text-gray-600">or</span>
                <div className="flex-1 border-t border-gray-800"></div>
              </div>
              <button onClick={() => window.open(currentOrder.paymentUrl, '_blank')}
                className="flex items-center gap-3 p-4 rounded-xl border border-gray-800 bg-[#161616] hover:bg-[#1e1e1e] transition-all text-left w-full">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 flex items-center justify-center text-lg flex-shrink-0">💻</div>
                <div>
                  <div className="text-sm font-semibold">Pay instantly on This Device</div>
                  <div className="text-xs text-gray-500">Use bunq Web to accept requests</div>
                </div>
                <span className="text-gray-600 ml-auto">›</span>
              </button>
              <div className="flex items-center gap-2 justify-center mt-4 text-xs text-gray-500">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                Waiting for payment...
              </div>
            </div>
          )}

          {/* SUCCESS VIEW */}
          {view === "success" && (
            <div className="flex flex-col items-center text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold mb-2">Payment Received!</h2>
              <p className="text-gray-400 text-sm mb-2">€{amount} has been processed</p>
              <p className="text-gray-600 text-xs mb-8">Transaction confirmed</p>
              <button onClick={resetAll} className="bg-[#ff6b00] text-white font-bold py-3 px-8 rounded-xl hover:bg-[#e06000] transition-all">
                New Payment
              </button>
            </div>
          )}

        </div>
      </div>

      <div className="mt-6 text-center text-xs text-gray-700">
        <a href="#" className="hover:text-gray-500 mr-4">More about bunq</a>
        <a href="#" className="hover:text-gray-500 mr-4">Terms & Conditions</a>
        <a href="#" className="hover:text-gray-500">Add to your website</a>
      </div>
    </div>
  );
};

export default PaymentCard;