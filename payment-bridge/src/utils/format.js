// ─── src/utils/format.js ─────────────────────────────────────────────────────
// Shared helpers used by all payment components.
// Import like: import { fmt, fmtCard, fmtExpiry, EUR_TO_USD } from "../utils/format";

// Live exchange rate — Step 13 তে backend থেকে fetch করবে
export const EUR_TO_USD = 1.09;

/**
 * Format a number as currency string
 * fmt(45, "USD") → "$45.00"
 * fmt(45, "EUR") → "€45.00"
 */
export function fmt(amount, currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format raw card number input → "1234 5678 9012 3456"
 */
export function fmtCard(value) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

/**
 * Format expiry input → "MM / YY"
 */
export function fmtExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) {
    return digits.slice(0, 2) + " / " + digits.slice(2);
  }
  return digits;
}

/**
 * Detect card network from first digit
 * Returns: "VISA" | "MC" | "AMEX" | "CARD"
 */
export function detectCardType(cardNumber) {
  const n = cardNumber.replace(/\s/g, "");
  if (n.startsWith("4")) return "VISA";
  if (n.startsWith("5")) return "MC";
  if (n.startsWith("3")) return "AMEX";
  return "CARD";
}

/**
 * Convert amount between currencies
 * convert(45, "EUR", "USD") → 49.05
 */
export function convert(amount, from, to) {
  if (from === to) return amount;
  if (from === "EUR" && to === "USD") return +(amount * EUR_TO_USD).toFixed(2);
  if (from === "USD" && to === "EUR") return +(amount / EUR_TO_USD).toFixed(2);
  return amount;
}