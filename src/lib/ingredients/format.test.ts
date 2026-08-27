import { describe, expect, it } from "vitest";
import { formatAmount, formatQuantity } from "./format";
import { parseIngredient } from "./parse";

describe("formatQuantity", () => {
  it("whole numbers", () => {
    expect(formatQuantity(2)).toBe("2");
    expect(formatQuantity(250)).toBe("250");
  });
  it("common fractions", () => {
    expect(formatQuantity(0.5)).toBe("½");
    expect(formatQuantity(1.5)).toBe("1½");
    expect(formatQuantity(1 / 3)).toBe("⅓");
    expect(formatQuantity(2.75)).toBe("2¾");
  });
  it("small amounts keep their precision", () => {
    expect(formatQuantity(1 / 16)).toBe("0.06");
    expect(formatQuantity(0.004)).toBe("0.01");
    expect(formatQuantity(0.125)).toBe("⅛");
  });

  it("other decimals are rounded", () => {
    expect(formatQuantity(2.4)).toBe("2.4");
    expect(formatQuantity(0.99)).toBe("1");
  });
});

describe("formatAmount", () => {
  it("with unit and range", () => {
    expect(formatAmount(parseIngredient("1 1/2 cups flour"))).toBe("1½ cup");
    expect(formatAmount(parseIngredient("2-3 cloves garlic"))).toBe("2–3 clove");
    expect(formatAmount(parseIngredient("salt"))).toBe("");
  });
});
