import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { migrate } from "./migrations";
import { addToPantry, listPantry, pantryMatcher, removeFromPantry } from "./pantry";

describe("pantry", () => {
  it("adds several at once, ignores duplicates in any case", () => {
    const db = new Database(":memory:");
    migrate(db);
    expect(addToPantry(db, "rice, Olive oil,\nsalt")).toBe(3);
    expect(addToPantry(db, "olive oil, RICE, flour")).toBe(1);
    const items = listPantry(db);
    expect(items.map((i) => i.name)).toEqual(["flour", "Olive oil", "rice", "salt"]);
    removeFromPantry(db, items[0].id);
    expect(listPantry(db)).toHaveLength(3);
  });
});

describe("pantryMatcher", () => {
  it("matches singular and plural", () => {
    const db = new Database(":memory:");
    migrate(db);
    addToPantry(db, "tomato, Rolled oats");
    const has = pantryMatcher(db);
    expect(has("tomatoes")).toBe(true);
    expect(has("rolled oat")).toBe(true);
    expect(has("onions")).toBe(false);
  });
});
