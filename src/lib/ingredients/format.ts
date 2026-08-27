import type { Ingredient } from "./parse";

// the fractions people actually use in recipes
const FRACTIONS: [number, string][] = [
  [1 / 8, "⅛"], [1 / 4, "¼"], [1 / 3, "⅓"], [3 / 8, "⅜"], [1 / 2, "½"],
  [5 / 8, "⅝"], [2 / 3, "⅔"], [3 / 4, "¾"], [7 / 8, "⅞"],
];

/** 1.5 -> "1½", 0.333 -> "⅓", 2.4 -> "2.4", 250 -> "250" */
export function formatQuantity(n: number): string {
  // halving "¼ tsp" twice gave "0.1"; show small amounts with two decimals instead
  if (n > 0 && n < 0.1) return String(Math.round(n * 100) / 100 || 0.01);
  const whole = Math.floor(n);
  const rest = n - whole;
  if (rest < 0.02) return String(whole);
  if (rest > 0.98) return String(whole + 1);
  const match = FRACTIONS.find(([v]) => Math.abs(v - rest) < 0.02);
  if (match) return whole === 0 ? match[1] : `${whole}${match[1]}`;
  return String(Math.round(n * 10) / 10);
}

export function formatAmount(ing: Ingredient): string {
  if (ing.quantity === null) return "";
  const amount = ing.quantityMax
    ? `${formatQuantity(ing.quantity)}–${formatQuantity(ing.quantityMax)}`
    : formatQuantity(ing.quantity);
  return ing.unit ? `${amount} ${ing.unit}` : amount;
}
