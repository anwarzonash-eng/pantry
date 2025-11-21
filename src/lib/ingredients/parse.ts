/** Turn a typed ingredient line into amount, unit and name. */

export type Ingredient = {
  raw: string;
  quantity: number | null;
  unit: string | null;
  name: string;
  note: string;
};

// spelling -> the unit we store
const UNITS: Record<string, string> = {
  cup: "cup", cups: "cup",
  tablespoon: "tbsp", tablespoons: "tbsp", tbsp: "tbsp", tbs: "tbsp",
  teaspoon: "tsp", teaspoons: "tsp", tsp: "tsp",
  g: "g", gram: "g", grams: "g",
  kg: "kg", kilogram: "kg", kilograms: "kg",
  ml: "ml", milliliter: "ml", milliliters: "ml", millilitre: "ml", millilitres: "ml",
  l: "l", liter: "l", liters: "l", litre: "l", litres: "l",
  oz: "oz", ounce: "oz", ounces: "oz",
  lb: "lb", lbs: "lb", pound: "lb", pounds: "lb",
  clove: "clove", cloves: "clove",
  can: "can", cans: "can",
  pinch: "pinch", pinches: "pinch",
  slice: "slice", slices: "slice",
  bunch: "bunch", bunches: "bunch",
};

const NUMBER = /^\d+(\.\d+)?$/;
const FRACTION = /^(\d+)\/(\d+)$/;
const GLUED = /^(\d+(?:\.\d+)?)([a-zA-Z]+)$/; // "200g"

export function parseIngredient(raw: string): Ingredient {
  const tokens = raw.trim().split(/\s+/);
  let quantity: number | null = null;

  const glued = tokens[0]?.match(GLUED);
  if (glued && UNITS[glued[2].toLowerCase()]) {
    tokens.splice(0, 1, glued[1], glued[2]);
  }

  if (NUMBER.test(tokens[0] ?? "")) {
    quantity = Number(tokens.shift());
    const frac = tokens[0]?.match(FRACTION);
    if (frac) {
      quantity += Number(frac[1]) / Number(frac[2]);
      tokens.shift();
    }
  } else {
    const frac = tokens[0]?.match(FRACTION);
    if (frac) {
      quantity = Number(frac[1]) / Number(frac[2]);
      tokens.shift();
    }
  }

  let unit: string | null = null;
  const maybeUnit = tokens[0]?.toLowerCase().replace(/\.$/, "");
  if (quantity !== null && maybeUnit && UNITS[maybeUnit]) {
    unit = UNITS[maybeUnit];
    tokens.shift();
  }

  const rest = tokens.join(" ");
  const comma = rest.indexOf(",");
  const name = (comma === -1 ? rest : rest.slice(0, comma)).trim();
  const note = comma === -1 ? "" : rest.slice(comma + 1).trim();
  return { raw, quantity, unit, name, note };
}
