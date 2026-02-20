import { describe, expect, it } from "vitest";
import { parseIngredient } from "../ingredients/parse";
import { buildShoppingList, type Needed } from "./build";

const need = (recipe: string, line: string, factor = 1): Needed => ({ recipe, ingredient: parseIngredient(line), factor });
const short = (l: { name: string; quantity: number | null; unit: string | null }) =>
  `${l.quantity === null ? "" : Math.round(l.quantity * 100) / 100}${l.unit ? " " + l.unit : ""} ${l.name}`.trim();

describe("buildShoppingList", () => {
  it("sums the same ingredient across recipes", () => {
    const list = buildShoppingList([need("Pasta", "200 g spaghetti"), need("Bake", "300 g spaghetti")]);
    expect(list.map(short)).toEqual(["500 g spaghetti"]);
    expect(list[0].recipes).toEqual(["Bake", "Pasta"]);
  });

  it("converts compatible units and picks a readable one", () => {
    const list = buildShoppingList([need("A", "800 g flour"), need("B", "0.5 kg flour")]);
    expect(list.map(short)).toEqual(["1.3 kg flour"]);
    expect(buildShoppingList([need("A", "1 tbsp oil"), need("B", "3 tsp oil")]).map(short)).toEqual(["29.57 ml oil"]);
  });

  it("same non-convertible unit is summed, different ones are not", () => {
    const list = buildShoppingList([need("A", "1 can tomatoes"), need("B", "2 cans tomatoes"), need("C", "3 tomatoes")]);
    expect(list.map(short)).toEqual(["3 can tomatoes", "3 tomatoes"]);
  });

  it("applies the servings factor", () => {
    expect(buildShoppingList([need("A", "2 eggs", 1.5)]).map(short)).toEqual(["3 eggs"]);
  });

  it("is case-insensitive and keeps items without an amount once", () => {
    const list = buildShoppingList([need("A", "Salt"), need("B", "salt"), need("C", "olive oil")]);
    expect(list.map(short)).toEqual(["olive oil", "Salt"]);
  });

  it("imperial output", () => {
    expect(buildShoppingList([need("A", "250 ml milk")], "imperial").map(short)).toEqual(["1.06 cup milk"]);
  });
});
