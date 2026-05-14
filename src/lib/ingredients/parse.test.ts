import { describe, expect, it } from "vitest";
import { parseIngredient, sectionHeading } from "./parse";

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

describe("parseIngredient, more forms", () => {
  it("unicode fractions", () => {
    expect(p("½ cup sugar").quantity).toBe(0.5);
    expect(p("1½ cups milk").quantity).toBe(1.5);
    expect(p("1 ¼ tsp baking soda").quantity).toBe(1.25);
    expect(p("¾ cup oats").quantity).toBe(0.75);
  });

  it("ranges", () => {
    const r = parseIngredient("2-3 cloves garlic");
    expect([r.quantity, r.quantityMax, r.unit, r.name]).toEqual([2, 3, "clove", "garlic"]);
    expect(parseIngredient("2 to 3 tbsp honey").quantityMax).toBe(3);
    expect(parseIngredient("4–6 slices bread").quantityMax).toBe(6);
  });

  it("a / an and 'of'", () => {
    expect(p("a pinch of salt")).toEqual({ quantity: 1, unit: "pinch", name: "salt", note: "" });
    expect(p("an onion, diced")).toEqual({ quantity: 1, unit: null, name: "onion", note: "diced" });
    expect(p("2 cups of water").name).toBe("water");
  });
});

describe("parseIngredient, brackets", () => {
  it("size in brackets becomes a note", () => {
    expect(p("1 (14 oz) can chopped tomatoes")).toEqual({
      quantity: 1,
      unit: "can",
      name: "chopped tomatoes",
      note: "14 oz",
    });
    expect(p("2 (400 g) cans chickpeas, drained").note).toBe("400 g, drained");
  });

  it("brackets later in the line stay in the name", () => {
    expect(p("1 cup stock (or water)").name).toBe("stock (or water)");
  });
});

describe("sectionHeading", () => {
  it("lines ending in a colon", () => {
    expect(sectionHeading("For the sauce:")).toBe("For the sauce");
    expect(sectionHeading(" Topping: ")).toBe("Topping");
    expect(sectionHeading("2 cups flour")).toBeNull();
    expect(sectionHeading("1 tsp salt:")).toBeNull();
    expect(sectionHeading(":")).toBeNull();
  });
});
