import { describe, expect, it } from "vitest";
import { aisleFor, groupByAisle } from "./aisles";

describe("aisleFor", () => {
  it("common items", () => {
    expect(aisleFor("red onion")).toBe("Fruit & veg");
    expect(aisleFor("spaghetti")).toBe("Dry goods");
    expect(aisleFor("eggs")).toBe("Dairy & eggs");
    expect(aisleFor("chicken thighs")).toBe("Meat & fish");
    expect(aisleFor("dish soap")).toBe("Household");
    expect(aisleFor("something odd")).toBe("Other");
  });

  it("first match wins for ambiguous names", () => {
    expect(aisleFor("coconut milk")).toBe("Tins & jars");
    expect(aisleFor("black pepper")).toBe("Spices & baking");
    expect(aisleFor("dried oregano")).toBe("Spices & baking");
    expect(aisleFor("olive oil")).toBe("Dry goods");
  });
});

describe("groupByAisle", () => {
  it("keeps shop order and drops empty aisles", () => {
    const groups = groupByAisle([{ name: "milk" }, { name: "carrot" }, { name: "cheddar" }]);
    expect(groups.map((g) => g.aisle)).toEqual(["Fruit & veg", "Dairy & eggs"]);
    expect(groups[1].items.map((i) => i.name)).toEqual(["milk", "cheddar"]);
  });
});
