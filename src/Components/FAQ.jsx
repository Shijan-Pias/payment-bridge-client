import { useState } from "react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How does bunq.me work?",
      answer: "Share your bunq.me link and anyone can send you money — no bunq account required on their end. Just open the link, pick a payment method, and the money lands straight in your bunq account. It’s the easiest way to get paid back, split a bill, or collect money from a group."
    },
    {
      question: "What methods are supported?",
      answer: "We support a wide range of payment methods including iDEAL, credit card, Apple Pay, Google Pay, Revolut, Monzo, and Wero — so whoever owes you money really has no excuse. Available methods may vary depending on the payer’s country."
    },
    {
      question: "Is bunq.me secure?",
      answer: "Absolutely. bunq.me runs on the same secure infrastructure as the rest of bunq. Every payment is encrypted and processed safely, so you can share your link without giving it a second thought. We're a fully licensed bank — security isn't an afterthought, it's the foundation."
    },
    {
      question: "Do I need a crypto wallet to make a payment?",
      answer: "No, you don't need any crypto wallet or knowledge to pay. You simply use your standard Visa/Mastercard or banking app (like Revolut or Monzo) to pay in Euro (€) or USD ($). Our secure gateway handles the automatic conversion behind the scenes."
    },
    {
      question: "Are there any hidden fees or exchange rate charges?",
      answer: "The amount you see on the screen is exactly what you pay. The real-time exchange rates and processing fees are calculated upfront by our secure payment gateway (NOWPayments), ensuring total transparency before you confirm the transaction."
    },
    {
      question: "How long does it take for a payment to process?",
      answer: "Card payments and supported instant bank transfers (like Revolut or Monzo) are processed immediately. You will receive a success confirmation on your screen within seconds of authorizing the payment."
    },
    {
      question: "Can I report misuse?",
      answer: "Yes, and please do so. If you come across a payment link being used for something that doesn’t seem right, you can contact our support team. We take misuse seriously and act on reports quickly to keep the platform safe for everyone."
    }
  ];

  return (
    <div className=" min-h-screen bg-black mx-auto px-4 py-12 font-sans text-white">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Frequently Asked Questions</h2>
        <p className="text-gray-400 text-sm">Everything you need to know about making secure payments.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className="bg-[#111111] border border-gray-800 rounded-2xl overflow-hidden transition-all duration-300"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none hover:bg-[#1a1a1a] transition-colors"
            >
              <span className="font-semibold text-[15px] pr-4">{faq.question}</span>
              <span className={`text-xl transition-transform duration-300 text-gray-400 ${openIndex === index ? "rotate-45 text-[#ff6b00]" : ""}`}>
                +
              </span>
            </button>
            
            <div 
              className={`transition-all duration-300 ease-in-out ${
                openIndex === index ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-6 pb-5 pt-1 text-gray-400 text-sm leading-relaxed border-t border-gray-800/50 mt-2">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;