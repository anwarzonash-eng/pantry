import type { Ingredient } from "../ingredients/parse";
import { bestUnit, toBase, type UnitSystem } from "../ingredients/units";

export type ShoppingLine = {
  name: string;
  /** null when no recipe gave an amount ("salt to taste"). */
  quantity: number | null;
  unit: string | null;
  /** Recipe titles that need it. */
  recipes: string[];
};

export type Needed = { recipe: string; ingredient: Ingredient; factor: number };

const key = (name: string) => name.toLowerCase().replace(/\s+/g, " ").trim();

/**
 * Add up the ingredients of the planned meals. Amounts of the same thing are
 * summed when their units can be converted (g + kg, tsp + tbsp) or are the same
 * (2 cans + 1 can); otherwise they get separate lines.
 */
export function buildShoppingList(needed: Needed[], system: UnitSystem = "metric"): ShoppingLine[] {
  type Acc = { name: string; base: number; dimension: "volume" | "mass" | null; unit: string | null; amount: number | null; recipes: Set<string> };
  const groups = new Map<string, Acc>();

  for (const { recipe, ingredient, factor } of needed) {
    if (!ingredient.name) continue;
    const q = ingredient.quantity === null ? null : ingredient.quantity * factor;
    const base = q === null ? null : toBase(q, ingredient.unit);
    const groupKey = base
      ? `${key(ingredient.name)}|${base.dimension}`
      : `${key(ingredient.name)}|${q === null ? "" : (ingredient.unit ?? "each")}`;

    let acc = groups.get(groupKey);
    if (!acc) {
      acc = { name: ingredient.name, base: 0, dimension: base?.dimension ?? null, unit: base ? null : ingredient.unit, amount: null, recipes: new Set() };
      groups.set(groupKey, acc);
    }
    if (base) acc.base += base.quantity;
    else if (q !== null) acc.amount = (acc.amount ?? 0) + q;
    acc.recipes.add(recipe);
  }

  // an amount-less line ("garlic") is dropped when the same thing has an amount elsewhere
  const named = new Set([...groups.entries()].filter(([k]) => !k.endsWith("|")).map(([k]) => k.split("|")[0]));

  const lines: ShoppingLine[] = [];
  for (const [groupKey, acc] of groups) {
    if (groupKey.endsWith("|") && named.has(groupKey.split("|")[0])) continue;
    const recipes = [...acc.recipes].sort();
    if (acc.dimension) {
      const best = bestUnit(acc.base, acc.dimension, system);
      lines.push({ name: acc.name, quantity: best.quantity, unit: best.unit, recipes });
    } else {
      lines.push({ name: acc.name, quantity: acc.amount, unit: acc.unit, recipes });
    }
  }
  return lines.sort((a, b) => a.name.localeCompare(b.name));
}
