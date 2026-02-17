/** Turn a typed ingredient line into amount, unit and name. */

export type Ingredient = {
  raw: string;
  quantity: number | null;
  /** Upper end of a range like "2-3 cloves". */
  quantityMax: number | null;
  unit: string | null;
  name: string;
  note: string;
};

import { normalizeUnit } from "./units";

const UNICODE_FRACTIONS: Record<string, number> = {
  "½": 1 / 2, "⅓": 1 / 3, "⅔": 2 / 3, "¼": 1 / 4, "¾": 3 / 4,
  "⅕": 1 / 5, "⅛": 1 / 8, "⅜": 3 / 8, "⅝": 5 / 8, "⅞": 7 / 8,
};
const UNICODE = new RegExp(`[${Object.keys(UNICODE_FRACTIONS).join("")}]`, "g");

const NUMBER = /^\d+(\.\d+)?$/;
const FRACTION = /^(\d+)\/(\d+)$/;
const GLUED = /^(\d+(?:\.\d+)?)([a-zA-Z]+)$/; // "200g"

/** "1½" -> "1 1/2", "2–3" -> "2-3", "2 to 3" -> "2-3" so the tokenizer sees simple forms. */
function normalize(line: string): string {
  return line
    .replace(/(\d)\s*([½⅓⅔¼¾⅕⅛⅜⅝⅞])/g, "$1 $2")
    .replace(UNICODE, (c) => {
      const v = UNICODE_FRACTIONS[c];
      return v === 0.5 ? "1/2" : String(Math.round(v * 1000) / 1000);
    })
    .replace(/(\d)\s*[–—]\s*(\d)/g, "$1-$2")
    .replace(/(\d)\s+to\s+(\d)/gi, "$1-$2");
}

const RANGE = /^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/;

export function parseIngredient(raw: string): Ingredient {
  // "1 (14 oz) can tomatoes": a size in brackets right after the amount is a note,
  // the can is the unit. Brackets anywhere else stay part of the name.
  const sized = raw.trim().match(/^([\d./½⅓⅔¼¾⅕⅛⅜⅝⅞-]+)\s*\(([^)]*)\)\s*(.*)$/);
  const sizeNote = sized ? sized[2].trim() : "";
  const line = sized ? `${sized[1]} ${sized[3]}` : raw.trim();
  const tokens = normalize(line).split(/\s+/);
  let quantity: number | null = null;
  let quantityMax: number | null = null;

  // "a pinch of salt", "an onion"
  if (/^(a|an)$/i.test(tokens[0] ?? "") && tokens.length > 1) {
    tokens.splice(0, 1, "1");
  }

  const range = tokens[0]?.match(RANGE);
  if (range) {
    tokens.splice(0, 1, range[1]);
    quantityMax = Number(range[2]);
  }

  const glued = tokens[0]?.match(GLUED);
  if (glued && normalizeUnit(glued[2])) {
    tokens.splice(0, 1, glued[1], glued[2]);
  }

  if (NUMBER.test(tokens[0] ?? "")) {
    quantity = Number(tokens.shift());
    const frac = tokens[0]?.match(FRACTION);
    if (frac) {
      quantity += Number(frac[1]) / Number(frac[2]);
      tokens.shift();
    } else if (tokens[0] && /^0\.\d+$/.test(tokens[0])) {
      // came from a unicode fraction: "1 0.333"
      quantity += Number(tokens.shift());
    }
  } else {
    const frac = tokens[0]?.match(FRACTION);
    if (frac) {
      quantity = Number(frac[1]) / Number(frac[2]);
      tokens.shift();
    }
  }

  let unit: string | null = null;
  const maybeUnit = quantity !== null && tokens[0] ? normalizeUnit(tokens[0]) : null;
  if (maybeUnit) {
    unit = maybeUnit;
    tokens.shift();
    if (tokens[0]?.toLowerCase() === "of") tokens.shift();
  }

  const rest = tokens.join(" ");
  const comma = rest.indexOf(",");
  const name = (comma === -1 ? rest : rest.slice(0, comma)).trim();
  const after = comma === -1 ? "" : rest.slice(comma + 1).trim();
  const note = [sizeNote, after].filter(Boolean).join(", ");
  return { raw, quantity, quantityMax, unit, name, note };
}
