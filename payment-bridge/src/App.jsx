// ─── src/App.jsx ─────────────────────────────────────────────────────────────
// Main router — manages screen state and passes data between components
//
// Screen flow:
//   invoice → form → processing → success
//                ↑                    |
//                └────────────────────┘ (onNewPayment)

import { useState } from "react";
// import InvoicePage       from "./components/payment/InvoicePage";
// // import PaymentForm       from "./components/payment/PaymentForm";
// import ProcessingScreen  from "./components/payment/ProcessingScreen";
// import SuccessScreen     from "./components/payment/SuccessScreen";
import PaymentForm from "./payment/PaymentForm";
import InvoicePage from "./payment/InvoicePage";
import ProcessingScreen from "./payment/ProcessingScreen";
import SuccessScreen from "./payment/SuccessScreen";

export default function App() {
  // Which screen to show
  const [screen, setScreen] = useState("invoice");

  // Data passed between screens
  const [invoiceData, setInvoiceData] = useState(null);
  // invoiceData = { total: number, currency: "USD"|"EUR" }

  const [paymentId, setPaymentId] = useState(null);
  // paymentId = string — returned from backend after charge

  // ── Screen: Invoice ────────────────────────────────────────────────────────
  if (screen === "invoice") {
    return (
      <InvoicePage
        onProceed={(data) => {
          setInvoiceData(data);
          setScreen("form");
        }}
      />
    );
  }

  // ── Screen: Payment form ───────────────────────────────────────────────────
  if (screen === "form") {
    return (
      <PaymentForm
        amount={invoiceData.total}
        currency={invoiceData.currency}
        onBack={() => setScreen("invoice")}
        onCharge={(id) => {
          setPaymentId(id);
          setScreen("processing");
        }}
      />
    );
  }

  // ── Screen: Processing ─────────────────────────────────────────────────────
  if (screen === "processing") {
    return (
      <ProcessingScreen
        paymentId={paymentId}
        onDone={() => setScreen("success")}
      />
    );
  }

  // ── Screen: Success ────────────────────────────────────────────────────────
  if (screen === "success") {
    return (
      <SuccessScreen
        paymentId={paymentId}
        amount={invoiceData.total}
        currency={invoiceData.currency}
        onNewPayment={() => {
          // Reset everything
          setScreen("invoice");
          setInvoiceData(null);
          setPaymentId(null);
        }}
      />
    );
  }

  return null;
}