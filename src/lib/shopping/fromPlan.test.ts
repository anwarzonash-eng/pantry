import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { migrate } from "../migrations";
import { addToPantry, pantryMatcher } from "../pantry";
import { addToPlan } from "../plan";
import { createRecipe } from "../recipes";
import { shoppingForWeek } from "./fromPlan";
import { listItems, saveGenerated } from "./list";

// the whole path a user takes: recipes -> plan -> list, with the pantry in between
describe("shopping list from the plan", () => {
  it("scales by planned servings, adds up, skips headings and pantry items", () => {
    const db = new Database(":memory:");
    migrate(db);
    const pasta = createRecipe(db, {
      title: "Pasta",
      servings: 2,
      ingredients: ["200 g spaghetti", "For the sauce:", "1 (400 g) can tomatoes", "2 cloves garlic", "salt"],
      steps: [],
    });
    const bake = createRecipe(db, {
      title: "Bake",
      servings: 4,
      ingredients: ["0.5 kg spaghetti", "1 can tomatoes", "garlic"],
      steps: [],
    });
    addToPlan(db, { date: "2026-08-10", slot: "dinner", recipeId: pasta.id, servings: 4 }); // doubled
    addToPlan(db, { date: "2026-08-12", slot: "dinner", recipeId: bake.id });
    addToPlan(db, { date: "2026-08-17", slot: "dinner", recipeId: bake.id }); // next week

    const lines = shoppingForWeek(db, "2026-08-10");
    const show = (l: (typeof lines)[number]) => `${l.quantity ?? ""} ${l.unit ?? ""} ${l.name}`.replace(/\s+/g, " ").trim();
    expect(lines.map(show)).toEqual(["4 clove garlic", "salt", "900 g spaghetti", "3 can tomatoes"]);

    addToPantry(db, "salt");
    saveGenerated(db, "2026-08-10", lines, pantryMatcher(db));
    expect(listItems(db, "2026-08-10").filter((i) => i.inPantry).map((i) => i.name)).toEqual(["salt"]);
  });
});
