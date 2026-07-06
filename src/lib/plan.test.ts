import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { migrate } from "./migrations";
import { addToPlan, copyWeek, mealsBetween, removeFromPlan, suggestDinners } from "./plan";
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

describe("copyWeek", () => {
  it("copies into empty slots only", () => {
    const db = new Database(":memory:");
    migrate(db);
    const a = createRecipe(db, { title: "A", ingredients: [], steps: [] });
    const b = createRecipe(db, { title: "B", ingredients: [], steps: [] });
    addToPlan(db, { date: "2026-06-15", slot: "dinner", recipeId: a.id, servings: 4 });
    addToPlan(db, { date: "2026-06-16", slot: "dinner", recipeId: a.id });
    addToPlan(db, { date: "2026-06-23", slot: "dinner", recipeId: b.id }); // Tuesday next week already planned

    expect(copyWeek(db, "2026-06-15", "2026-06-22")).toBe(1);
    const next = mealsBetween(db, "2026-06-22", "2026-06-28");
    expect(next.map((m) => `${m.date}:${m.title}:${m.servings}`)).toEqual(["2026-06-22:A:4", "2026-06-23:B:null"]);
  });
});

describe("suggestDinners", () => {
  it("prefers dinners not planned for a long time", () => {
    const db = new Database(":memory:");
    migrate(db);
    const curry = createRecipe(db, { title: "Curry", ingredients: [], steps: [], tags: ["dinner"] });
    const pasta = createRecipe(db, { title: "Pasta", ingredients: [], steps: [], tags: ["dinner"] });
    createRecipe(db, { title: "Stew", ingredients: [], steps: [], tags: ["dinner"] });
    createRecipe(db, { title: "Oats", ingredients: [], steps: [], tags: ["breakfast"] });
    addToPlan(db, { date: "2026-06-01", slot: "dinner", recipeId: curry.id });
    addToPlan(db, { date: "2026-06-10", slot: "dinner", recipeId: pasta.id });
    expect(suggestDinners(db, "2026-06-22").map((r) => r.title)).toEqual(["Stew", "Curry", "Pasta"]);
    expect(suggestDinners(db, "2026-06-22", 1).map((r) => r.title)).toEqual(["Stew"]);
  });
});

describe("deleting a recipe", () => {
  it("removes it from the plan and drops unused tags", async () => {
    const { deleteRecipe, listTags } = await import("./recipes");
    const db = new Database(":memory:");
    db.pragma("foreign_keys = ON");
    migrate(db);
    const soup = createRecipe(db, { title: "Soup", ingredients: [], steps: [], tags: ["lunch", "winter"] });
    createRecipe(db, { title: "Salad", ingredients: [], steps: [], tags: ["lunch"] });
    addToPlan(db, { date: "2026-06-22", slot: "lunch", recipeId: soup.id });
    deleteRecipe(db, soup.id);
    expect(mealsBetween(db, "2026-06-22", "2026-06-28")).toEqual([]);
    expect(db.prepare("SELECT COUNT(*) AS n FROM meal_plan").get()).toEqual({ n: 0 });
    expect(listTags(db).map((t) => t.name)).toEqual(["lunch"]);
  });

  it("the migration cleans up rows left by earlier deletes", () => {
    const db = new Database(":memory:");
    migrate(db);
    expect(db.pragma("user_version", { simple: true })).toBeGreaterThanOrEqual(13);
    const fk = db.prepare("PRAGMA foreign_key_list(meal_plan)").all() as { table: string; on_delete: string }[];
    expect(fk[0]).toMatchObject({ table: "recipes", on_delete: "CASCADE" });
  });
});
