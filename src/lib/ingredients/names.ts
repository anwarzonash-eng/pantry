// words that end in "s" but are not plurals
const KEEP = new Set(["hummus", "couscous", "asparagus", "molasses", "swiss", "citrus", "grits", "bass", "harissa", "lettuce", "quinoa", "peas"]);

function singular(word: string): string {
  if (KEEP.has(word) || word.length <= 3) return word;
  if (word.endsWith("ies")) return word.slice(0, -3) + "y"; // berries
  if (word.endsWith("ves")) return word.slice(0, -3) + "f"; // leaves
  if (/(oes|ches|shes|xes|sses)$/.test(word)) return word.slice(0, -2); // tomatoes, peaches
  if (word.endsWith("s") && !word.endsWith("ss") && !word.endsWith("us")) return word.slice(0, -1);
  return word;
}

/**
 * The form used to match ingredients: lowercase, single spaces, last word in
 * the singular. "Cherry Tomatoes" and "cherry tomato" become the same.
 */
export function normalizeName(name: string): string {
  const words = name.toLowerCase().replace(/\s+/g, " ").trim().split(" ");
  if (words.length && words[0]) words[words.length - 1] = singular(words[words.length - 1]);
  return words.join(" ");
}
