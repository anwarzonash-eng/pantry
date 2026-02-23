import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { migrate } from "../migrations";
import { listItems, saveGenerated, setChecked } from "./list";

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
