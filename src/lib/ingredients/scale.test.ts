import { describe, expect, it } from "vitest";
import { parseIngredient } from "./parse";
import { scaleIngredient } from "./scale";

describe("scaleIngredient", () => {
  it("scales amounts and ranges", () => {
    const s = scaleIngredient(parseIngredient("2-3 cloves garlic"), 2);
    expect([s.quantity, s.quantityMax]).toEqual([4, 6]);
    expect(scaleIngredient(parseIngredient("1 1/2 cups rice"), 0.5).quantity).toBe(0.75);
  });

  it("leaves lines without an amount alone", () => {
    const salt = parseIngredient("salt to taste");
    expect(scaleIngredient(salt, 3)).toBe(salt);
  });
});
