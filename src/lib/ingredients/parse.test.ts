import { describe, expect, it } from "vitest";
import { parseIngredient } from "./parse";

const p = (line: string) => {
  const { quantity, unit, name, note } = parseIngredient(line);
  return { quantity, unit, name, note };
};

describe("parseIngredient", () => {
  it("number, unit, name", () => {
    expect(p("2 cups flour")).toEqual({ quantity: 2, unit: "cup", name: "flour", note: "" });
    expect(p("1 tbsp olive oil")).toEqual({ quantity: 1, unit: "tbsp", name: "olive oil", note: "" });
  });

  it("decimals, fractions and mixed numbers", () => {
    expect(p("0.5 l milk").quantity).toBe(0.5);
    expect(p("1/2 tsp salt")).toEqual({ quantity: 0.5, unit: "tsp", name: "salt", note: "" });
    expect(p("1 1/2 cups rice").quantity).toBe(1.5);
  });

  it("unit glued to the number", () => {
    expect(p("200g spaghetti")).toEqual({ quantity: 200, unit: "g", name: "spaghetti", note: "" });
  });

  it("no unit", () => {
    expect(p("3 eggs")).toEqual({ quantity: 3, unit: null, name: "eggs", note: "" });
  });

  it("no quantity", () => {
    expect(p("salt and pepper")).toEqual({ quantity: null, unit: null, name: "salt and pepper", note: "" });
  });

  it("note after a comma", () => {
    expect(p("2 cloves garlic, crushed")).toEqual({ quantity: 2, unit: "clove", name: "garlic", note: "crushed" });
  });

  it("units are case-insensitive and may end with a dot", () => {
    expect(p("2 Tbsp. butter").unit).toBe("tbsp");
  });
});
