import { useState } from "react";
import QRCode from "react-qr-code";

const PaymentCard = () => {
  const [amount, setAmount] = useState("");
  const [view, setView] = useState("main"); // 'main', 'card_form', 'qr_view'
  const [activeMethod, setActiveMethod] = useState("");
  const [qrLink, setQrLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const otherMethods = [
    { id: "BUNQ", label: "From a bunq account", icon: "🌈" },
    { id: "IDEAL", label: "iDEAL | Wero", icon: "🟣" },
    { id: "BANCONTACT", label: "Bancontact", icon: "🔵" },
  ];

  const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
  ];

  // ==========================================
  // ১. মেইন পেজ থেকে মেথড সিলেক্ট করার ফাংশন
  // ==========================================
  const handleMethodSelection = async (methodId) => {
    setActiveMethod(methodId);
    
    if (methodId === "CARD") {
      // কার্ড হলে সরাসরি কার্ড ফর্মে চলে যাবে (কোনো API কল ছাড়াই)
      setView("card_form");
    } else {
      // অন্য মেথড (IDEAL, BUNQ) হলে ব্যাকএন্ডে API কল করবে
      processPaymentAPI(methodId);
    }
  };

  // ==========================================
  // ২. ব্যাকএন্ডে API কল করার মূল ফাংশন
  // ==========================================
  const processPaymentAPI = async (methodId) => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), method: methodId }),
      });
      
      const data = await response.json();

      if (data.success) {
        setQrLink(data.paymentUrl); // API থেকে পাওয়া লিংক
        setView("qr_view");
      } else {
        alert("NOWPayments API Error: Please add valid API Key in Backend .env file.");
      }
    } catch (error) {
      alert("Server error! Make sure backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  // কার্ড ফর্মের সাবমিট বাটন
  const handleCardSubmit = (e) => {
    e.preventDefault();
    processPaymentAPI("CARD"); // কার্ডের ডিটেইলস দেওয়ার পর API কল হবে
  };

  return (
    <div className="min-h-screen bg-[#1c1c1e] flex flex-col items-center pt-10 font-sans text-white">
      
      {/* Top bunq Logo */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold tracking-tight">bunq</h1>
        <p className="text-[10px] tracking-widest text-gray-400 mt-1">BANK OF THE FREE</p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md rounded-[32px] p-[3px] bg-gradient-to-b from-[#00d084] via-[#8a2be2] to-[#ff6b00]">
        <div className="bg-[#121212] rounded-[30px] w-full p-6 min-h-[500px] shadow-2xl relative">
          
          {/* ================= MAIN VIEW ================= */}
          {view === "main" && (
            <div className="flex flex-col h-full animate-fade-in">
              <div className="flex items-center gap-2 bg-[#0a3f2b] text-[#00d084] px-4 py-2 rounded-full w-max mb-6">
                <span className="text-sm font-semibold">✔ Pay securely</span>
              </div>

              <div className="flex items-center gap-3 mb-6 bg-[#1a1a1a] p-3 rounded-2xl w-max border border-gray-800">
                <span className="text-xl">💰</span>
                <span className="text-gray-300 font-medium">Add a description</span>
              </div>

              {/* Amount Input */}
              <div className="flex items-center text-[#ff6b00] font-bold text-6xl mb-8">
                <span>€</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-transparent outline-none w-full ml-2 placeholder-[#ff6b00] opacity-90"
                  placeholder="0"
                />
              </div>

              {/* Profile Area */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                </div>
                <div>
                  <h2 className="text-white text-lg font-semibold">Suranjit Kumar</h2>
                  <p className="text-gray-400 text-sm">NL94 BUNQ 2160 6315 66</p>
                </div>
              </div>

              {/* Credit Card Button - Disabled Logic */}
              <button 
                disabled={!amount || Number(amount) <= 0}
                onClick={() => handleMethodSelection("CARD")}
                className={`w-full font-bold py-4 rounded-xl mb-6 flex justify-center items-center gap-2 transition-all ${
                  !amount || Number(amount) <= 0 
                    ? "bg-[#1c1c1e] text-gray-500 cursor-not-allowed" 
                    : "bg-[#007aff] hover:bg-blue-600 text-white"     
                }`}
              >
                Pay with <span className="flex gap-1 bg-white px-1 rounded text-[10px] text-black items-center">VISA <span className="text-red-500">MC</span></span> Credit Card
              </button>

              {/* Other Methods */}
              <div className="border border-gray-800 rounded-2xl overflow-hidden">
                <div className="bg-[#1a1a1a] text-center py-3 text-sm font-medium border-b border-gray-800">Other ways to pay</div>
                <div className="bg-[#121212] flex flex-col">
                  {otherMethods.map((method) => (
                    <button 
                      key={method.id}
                      disabled={!amount || Number(amount) <= 0 || isLoading}
                      onClick={() => handleMethodSelection(method.id)}
                      className={`flex justify-between items-center p-4 border-b border-gray-800 transition-all ${
                        !amount || Number(amount) <= 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-[#1a1a1a] cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-3 font-medium">
                        <span className="text-xl">{method.icon}</span> {method.label}
                      </div>
                      {isLoading && activeMethod === method.id ? (
                        <span className="text-xs text-blue-500">Wait...</span>
                      ) : (
                        <span className="text-gray-500">ℹ️</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= CARD FORM VIEW ================= */}
          {view === "card_form" && (
            <div className="flex flex-col h-full animate-fade-in">
              <button onClick={() => setView("main")} className="mb-6 flex items-center w-max text-white hover:text-gray-300 font-bold">
                ← Back
              </button>
              <div className="flex items-center gap-2 mb-4 font-bold text-lg"><span className="text-2xl">💳</span> Credit Card</div>
              <p className="text-xs bg-[#002b66] text-blue-300 p-2 rounded mb-6">All fields are required unless marked otherwise.</p>
              
              <form onSubmit={handleCardSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-sm mb-1 block">Card number</label>
                  <input type="text" required className="w-full bg-[#2c2c2e] border-none rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="text-sm mb-1 block">Expiry date</label>
                    <input type="text" placeholder="MM/YY" required className="w-full bg-[#2c2c2e] border-none rounded-xl p-3 outline-none" />
                  </div>
                  <div className="w-1/2">
                    <label className="text-sm mb-1 block">Security code</label>
                    <input type="text" placeholder="CVC" required className="w-full bg-[#2c2c2e] border-none rounded-xl p-3 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-sm mb-1 block">Name on card</label>
                  <input type="text" required className="w-full bg-[#2c2c2e] border-none rounded-xl p-3 outline-none" />
                </div>
                
                <div>
                  <h3 className="font-bold mt-4">Billing address</h3>
                <div>
                  <label className="text-sm mb-1 block">Country/Region</label>
                  <select 
                    className="w-full bg-[#2c2c2e] border-none rounded-xl p-3 outline-none text-white appearance-none cursor-pointer"
                    defaultValue="Netherlands"
                  >
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
                </div>
                
                {/* Final Submit Button */}
                <button type="submit" disabled={isLoading} className="w-full bg-[#ff6b00] text-white font-bold py-4 rounded-xl mt-4 hover:bg-orange-600 transition-all">
                  {isLoading ? "Processing..." : `🔒 Pay €${amount}`}
                </button>
              </form>
            </div>
          )}

          {/* ================= QR CODE VIEW ================= */}
          {view === "qr_view" && (
            <div className="flex flex-col h-full items-center text-center animate-fade-in">
              <div className="w-full flex justify-start">
                <button onClick={() => setView("main")} className="mb-6 flex items-center text-white hover:text-gray-300 font-bold">
                  ← Back
                </button>
              </div>

              <div className="bg-[#2c2c2e] p-8 rounded-2xl w-full flex flex-col items-center">
                <div className="bg-white p-2 rounded-lg mb-4 text-black font-bold">
                  {activeMethod} Pay
                </div>
                <h2 className="text-3xl font-bold mb-6">€{amount}</h2>
                <div className="border border-gray-500 rounded p-1 mb-2 text-xs">Scan QR code</div>
                
                <div className="bg-white p-4 rounded-xl mb-4">
                  {qrLink ? <QRCode value={qrLink} size={180} /> : <div className="w-[180px] h-[180px] bg-gray-200 animate-pulse"></div>}
                </div>
                
                <p className="text-xs text-gray-400">This QR code is valid for 15:00</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PaymentCard;