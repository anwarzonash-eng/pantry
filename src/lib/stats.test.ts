import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { migrate } from "./migrations";
import { addToPlan } from "./plan";
import { createRecipe } from "./recipes";
import { cookingStats } from "./stats";

describe("cookingStats", () => {
  it("counts planned meals up to a date", () => {
    const db = new Database(":memory:");
    migrate(db);
    const dal = createRecipe(db, { title: "Dal", ingredients: [], steps: [] });
    const pasta = createRecipe(db, { title: "Pasta", ingredients: [], steps: [] });
    createRecipe(db, { title: "Tagine", ingredients: [], steps: [] });
    for (const date of ["2026-08-01", "2026-08-08", "2026-08-15"]) addToPlan(db, { date, slot: "dinner", recipeId: dal.id });
    addToPlan(db, { date: "2026-08-02", slot: "dinner", recipeId: pasta.id });
    addToPlan(db, { date: "2026-09-30", slot: "dinner", recipeId: pasta.id }); // future, not counted

    const s = cookingStats(db, "2026-08-31");
    expect(s.recipes).toBe(3);
    expect(s.planned).toBe(4);
    expect(s.mostPlanned).toEqual([
      { title: "Dal", slug: "dal", times: 3 },
      { title: "Pasta", slug: "pasta", times: 1 },
    ]);
    expect(s.neverPlanned.map((r) => r.title)).toEqual(["Tagine"]);
  });
});
