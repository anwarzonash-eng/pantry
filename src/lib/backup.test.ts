import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { exportAll } from "./backup";
import { migrate } from "./migrations";
import { addToPantry } from "./pantry";
import { addToPlan } from "./plan";
import { createRecipe } from "./recipes";

export function sampleDb() {
  const db = new Database(":memory:");
  migrate(db);
  const soup = createRecipe(db, { title: "Soup", servings: 4, ingredients: ["1 l stock"], steps: ["Heat."], tags: ["lunch"] });
  addToPlan(db, { date: "2026-03-23", slot: "lunch", recipeId: soup.id, servings: 2 });
  addToPantry(db, "salt, pepper");
  return db;
}

describe("exportAll", () => {
  it("includes recipes, plan and pantry", () => {
    const backup = exportAll(sampleDb(), new Date("2026-03-25T10:00:00Z"));
    expect(backup.version).toBe(1);
    expect(backup.recipes[0]).toMatchObject({ slug: "soup", tags: ["lunch"], ingredients: ["1 l stock"] });
    expect(backup.plan).toEqual([{ date: "2026-03-23", slot: "lunch", recipe: "soup", servings: 2 }]);
    expect(backup.pantry).toEqual(["pepper", "salt"]);
  });
});
