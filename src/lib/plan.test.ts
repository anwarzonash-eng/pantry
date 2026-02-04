import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { migrate } from "./migrations";
import { addToPlan, mealsBetween, removeFromPlan } from "./plan";
import { createRecipe } from "./recipes";

describe("meal plan", () => {
  it("adds, lists in order and removes", () => {
    const db = new Database(":memory:");
    migrate(db);
    const soup = createRecipe(db, { title: "Soup", ingredients: [], steps: [] });
    const oats = createRecipe(db, { title: "Oats", ingredients: [], steps: [] });
    addToPlan(db, { date: "2026-01-06", slot: "dinner", recipeId: soup.id });
    const id = addToPlan(db, { date: "2026-01-06", slot: "breakfast", recipeId: oats.id });
    addToPlan(db, { date: "2026-01-20", slot: "lunch", recipeId: soup.id });

    const week = mealsBetween(db, "2026-01-05", "2026-01-11");
    expect(week.map((m) => `${m.slot}:${m.title}`)).toEqual(["breakfast:Oats", "dinner:Soup"]);
    removeFromPlan(db, id);
    expect(mealsBetween(db, "2026-01-05", "2026-01-11")).toHaveLength(1);

    addToPlan(db, { date: "2026-01-07", slot: "dinner", recipeId: soup.id, servings: 6 });
    const dinner = mealsBetween(db, "2026-01-07", "2026-01-07")[0];
    expect([dinner.servings, dinner.recipeServings]).toEqual([6, 2]);
  });
});
