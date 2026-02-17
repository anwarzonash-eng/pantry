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
