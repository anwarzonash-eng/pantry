/** Spellings people use, mapped to the unit pantry stores. */
const ALIASES: Record<string, string> = {
  cup: "cup", cups: "cup", c: "cup",
  tablespoon: "tbsp", tablespoons: "tbsp", tbsp: "tbsp", tbs: "tbsp", tbl: "tbsp",
  teaspoon: "tsp", teaspoons: "tsp", tsp: "tsp",
  g: "g", gr: "g", gram: "g", grams: "g", gramme: "g", grammes: "g",
  kg: "kg", kilo: "kg", kilos: "kg", kilogram: "kg", kilograms: "kg",
  ml: "ml", milliliter: "ml", milliliters: "ml", millilitre: "ml", millilitres: "ml",
  cl: "cl", dl: "dl",
  l: "l", liter: "l", liters: "l", litre: "l", litres: "l",
  oz: "oz", ounce: "oz", ounces: "oz",
  lb: "lb", lbs: "lb", pound: "lb", pounds: "lb",
  pint: "pint", pints: "pint", quart: "quart", quarts: "quart",
  clove: "clove", cloves: "clove",
  can: "can", cans: "can", tin: "can", tins: "can",
  jar: "jar", jars: "jar",
  pinch: "pinch", pinches: "pinch", dash: "dash", dashes: "dash",
  slice: "slice", slices: "slice",
  bunch: "bunch", bunches: "bunch",
  sprig: "sprig", sprigs: "sprig",
  handful: "handful", handfuls: "handful",
  stick: "stick", sticks: "stick",
  packet: "packet", packets: "packet", pack: "packet", packs: "packet",
};

/** "Tbsp." -> "tbsp", "grams" -> "g", "carrots" -> null */
export function normalizeUnit(word: string): string | null {
  return ALIASES[word.toLowerCase().replace(/\.$/, "")] ?? null;
}

export type Dimension = "volume" | "mass";
export type UnitSystem = "metric" | "imperial";

// US customary volumes; close enough for cooking
const VOLUME_ML: Record<string, number> = {
  ml: 1, cl: 10, dl: 100, l: 1000,
  tsp: 4.929, tbsp: 14.787, cup: 236.6, pint: 473.2, quart: 946.4,
};
const MASS_G: Record<string, number> = { g: 1, kg: 1000, oz: 28.35, lb: 453.6 };

export function dimension(unit: string | null): Dimension | null {
  if (!unit) return null;
  if (unit in VOLUME_ML) return "volume";
  if (unit in MASS_G) return "mass";
  return null;
}

/** Amount in ml or g, or null for units like "clove" that do not convert. */
export function toBase(quantity: number, unit: string | null): { quantity: number; dimension: Dimension } | null {
  const dim = dimension(unit);
  if (!dim || !unit) return null;
  const factor = dim === "volume" ? VOLUME_ML[unit] : MASS_G[unit];
  return { quantity: quantity * factor, dimension: dim };
}

export function convert(quantity: number, from: string, to: string): number | null {
  const a = toBase(quantity, from);
  const b = toBase(1, to);
  if (!a || !b || a.dimension !== b.dimension) return null;
  return a.quantity / b.quantity;
}

/** Pick a readable unit for an amount in ml or g. */
export function bestUnit(base: number, dim: Dimension, system: UnitSystem = "metric"): { quantity: number; unit: string } {
  if (system === "metric") {
    if (dim === "volume") return base >= 1000 ? { quantity: base / 1000, unit: "l" } : { quantity: base, unit: "ml" };
    return base >= 1000 ? { quantity: base / 1000, unit: "kg" } : { quantity: base, unit: "g" };
  }
  if (dim === "volume") {
    if (base < VOLUME_ML.tbsp) return { quantity: base / VOLUME_ML.tsp, unit: "tsp" };
    if (base < VOLUME_ML.cup / 4) return { quantity: base / VOLUME_ML.tbsp, unit: "tbsp" };
    return { quantity: base / VOLUME_ML.cup, unit: "cup" };
  }
  return base < MASS_G.lb ? { quantity: base / MASS_G.oz, unit: "oz" } : { quantity: base / MASS_G.lb, unit: "lb" };
}

// spoons are the same everywhere, so they are never converted
const METRIC_UNITS = new Set(["g", "kg", "ml", "cl", "dl", "l"]);
const IMPERIAL_UNITS = new Set(["cup", "oz", "lb", "pint", "quart"]);

/**
 * Show an amount in the preferred system: 2 cups -> 473 ml for metric,
 * 500 g -> 1.1 lb for imperial. Other units stay as written.
 */
export function inSystem(quantity: number, unit: string | null, system: UnitSystem): { quantity: number; unit: string | null } {
  if (!unit) return { quantity, unit };
  const wrongSide = system === "metric" ? IMPERIAL_UNITS.has(unit) : METRIC_UNITS.has(unit);
  const base = wrongSide ? toBase(quantity, unit) : null;
  if (!base) return { quantity, unit };
  const best = bestUnit(base.quantity, base.dimension, system);
  // whole millilitres and grams read better than 236.6 ml
  if (system === "metric" && best.quantity >= 10) best.quantity = Math.round(best.quantity / 5) * 5;
  return best;
}

export const UNIT_COOKIE = "units";

export function parseSystem(value: string | undefined): UnitSystem | null {
  return value === "metric" || value === "imperial" ? value : null;
}
