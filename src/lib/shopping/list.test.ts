import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { migrate } from "../migrations";
import { addManualItem, listItems, removeItem, saveGenerated, setChecked } from "./list";

const line = (name: string, quantity: number | null = 1) => ({ name, quantity, unit: null, recipes: ["Soup"] });

describe("saved shopping list", () => {
  it("regenerating keeps ticks", () => {
    const db = new Database(":memory:");
    migrate(db);
    saveGenerated(db, "2026-02-02", [line("onion"), line("carrot")]);
    const carrot = listItems(db, "2026-02-02").find((i) => i.name === "carrot")!;
    setChecked(db, carrot.id, true);

    saveGenerated(db, "2026-02-02", [line("onion", 2), line("carrot"), line("leek")]);
    const items = listItems(db, "2026-02-02");
    expect(items.map((i) => `${i.name}:${i.checked}`)).toEqual(["carrot:true", "leek:false", "onion:false"]);
    expect(items.find((i) => i.name === "onion")?.quantity).toBe(2);
    expect(listItems(db, "2026-02-09")).toEqual([]);
  });
});

describe("pantry", () => {
  it("marks items you already have", () => {
    const db = new Database(":memory:");
    migrate(db);
    saveGenerated(db, "2026-02-02", [line("onion"), line("salt", null)], (n) => n === "salt");
    expect(listItems(db, "2026-02-02").map((i) => `${i.name}:${i.inPantry}`)).toEqual(["onion:false", "salt:true"]);
  });
});

describe("manual items", () => {
  it("survive regenerating and can be removed", () => {
    const db = new Database(":memory:");
    migrate(db);
    addManualItem(db, "2026-02-02", "dish soap", null, null);
    saveGenerated(db, "2026-02-02", [line("onion")]);
    const items = listItems(db, "2026-02-02");
    expect(items.map((i) => `${i.name}:${i.manual}`)).toEqual(["dish soap:true", "onion:false"]);
    removeItem(db, items[0].id);
    expect(listItems(db, "2026-02-02").map((i) => i.name)).toEqual(["onion"]);
  });
});
