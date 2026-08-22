/** Lowercase without accents, for matching: "Crème Brûlée" -> "creme brulee". */
export function fold(text: string): string {
  return text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
