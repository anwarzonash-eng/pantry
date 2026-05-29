import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { migrate } from "./migrations";
import { createRecipe, getRecipeBySlug, listTags, parseTags, updateRecipe } from "./recipes";

function db() {
  const d = new Database(":memory:");
  migrate(d);
  return d;
}

describe("recipes", () => {
  it("creates with a unique slug that survives a rename", () => {
    const d = db();
    const a = createRecipe(d, { title: "Tomato Soup", ingredients: ["1 can tomatoes"], steps: ["Heat."] });
    const b = createRecipe(d, { title: "Tomato soup", ingredients: [], steps: [] });
    expect([a.slug, b.slug]).toEqual(["tomato-soup", "tomato-soup-2"]);
    updateRecipe(d, a.id, { title: "Roasted Tomato Soup", ingredients: [], steps: [] });
    expect(getRecipeBySlug(d, "tomato-soup")?.title).toBe("Roasted Tomato Soup");
  });

  it("tags", () => {
    const d = db();
    const r = createRecipe(d, { title: "Dal", ingredients: [], steps: [], tags: ["dinner", "Vegetarian"] });
    createRecipe(d, { title: "Toast", ingredients: [], steps: [], tags: ["breakfast", "vegetarian"] });
    expect(r.tags).toEqual(["dinner", "Vegetarian"]);
    expect(listTags(d)).toEqual([
      { name: "breakfast", count: 1 },
      { name: "dinner", count: 1 },
      { name: "Vegetarian", count: 2 },
    ]);
    expect(updateRecipe(d, r.id, { title: "Dal", ingredients: [], steps: [], tags: ["quick"] })?.tags).toEqual(["quick"]);
  });

  it("parseTags trims and drops duplicates", () => {
    expect(parseTags("Dinner, quick , dinner,,")).toEqual(["Dinner", "quick"]);
  });
});

describe("listRecipes", () => {
  it("filters by tag, case-insensitively", async () => {
    const { listRecipes } = await import("./recipes");
    const d = db();
    createRecipe(d, { title: "Dal", ingredients: [], steps: [], tags: ["dinner"] });
    createRecipe(d, { title: "Toast", ingredients: [], steps: [], tags: ["breakfast"] });
    expect(listRecipes(d, { tag: "DINNER" }).map((r) => r.title)).toEqual(["Dal"]);
    expect(listRecipes(d).length).toBe(2);
  });
});

describe("search", () => {
  it("matches every word in title, description or ingredients", async () => {
    const { listRecipes } = await import("./recipes");
    const d = db();
    createRecipe(d, { title: "Chickpea Curry", ingredients: ["1 can chickpeas", "1 tbsp curry powder"], steps: [] });
    createRecipe(d, { title: "Hummus", ingredients: ["1 can chickpeas", "2 tbsp tahini"], steps: [] });
    expect(listRecipes(d, { q: "chickpeas" }).length).toBe(2);
    expect(listRecipes(d, { q: "chickpeas tahini" }).map((r) => r.title)).toEqual(["Hummus"]);
    expect(listRecipes(d, { q: "curry" }).map((r) => r.title)).toEqual(["Chickpea Curry"]);
    expect(listRecipes(d, { q: "100%" }).length).toBe(0);
  });
});

describe("details", () => {
  it("notes and source links", async () => {
    const { cleanUrl } = await import("./recipes");
    const d = db();
    const r = createRecipe(d, {
      title: "Bread",
      ingredients: [],
      steps: [],
      notes: " Less salt next time ",
      sourceUrl: "https://example.com/bread",
    });
    expect([r.notes, r.sourceUrl]).toEqual(["Less salt next time", "https://example.com/bread"]);
    expect(cleanUrl("javascript:alert(1)")).toBe("");
    expect(cleanUrl("not a url")).toBe("");
  });
});

describe("sorting", () => {
  it("by title and by total time", async () => {
    const { listRecipes } = await import("./recipes");
    const d = db();
    createRecipe(d, { title: "b slow", ingredients: [], steps: [], prepMinutes: 30, cookMinutes: 60 }, 1);
    createRecipe(d, { title: "A quick", ingredients: [], steps: [], cookMinutes: 10 }, 2);
    createRecipe(d, { title: "c untimed", ingredients: [], steps: [] }, 3);
    expect(listRecipes(d).map((r) => r.title)).toEqual(["c untimed", "A quick", "b slow"]);
    expect(listRecipes(d, { sort: "title" }).map((r) => r.title)).toEqual(["A quick", "b slow", "c untimed"]);
    expect(listRecipes(d, { sort: "quick" }).map((r) => r.title)).toEqual(["A quick", "b slow", "c untimed"]);
  });
});

describe("favourites", () => {
  it("toggle and filter", async () => {
    const { listRecipes, setFavorite } = await import("./recipes");
    const d = db();
    const a = createRecipe(d, { title: "A", ingredients: [], steps: [] });
    createRecipe(d, { title: "B", ingredients: [], steps: [] });
    setFavorite(d, a.id, true);
    expect(listRecipes(d, { favorites: true }).map((r) => r.title)).toEqual(["A"]);
    setFavorite(d, a.id, false);
    expect(listRecipes(d, { favorites: true })).toEqual([]);
  });
});

describe("duplicate", () => {
  it("copies everything under a new slug", async () => {
    const { duplicateRecipe } = await import("./recipes");
    const d = db();
    const r = createRecipe(d, { title: "Pancakes", ingredients: ["1 egg"], steps: ["Fry."], tags: ["breakfast"], cookMinutes: 10 });
    const copy = duplicateRecipe(d, r.id)!;
    expect(copy.slug).toBe("pancakes-copy");
    expect(copy.title).toBe("Pancakes (copy)");
    expect([copy.ingredients, copy.tags, copy.cookMinutes]).toEqual([["1 egg"], ["breakfast"], 10]);
    expect(duplicateRecipe(d, 999)).toBeNull();
  });
});
