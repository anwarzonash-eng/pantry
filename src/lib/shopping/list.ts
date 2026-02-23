import type Database from "better-sqlite3";
import type { ShoppingLine } from "./build";

export type ShoppingItem = {
  id: number;
  name: string;
  quantity: number | null;
  unit: string | null;
  recipes: string[];
  checked: boolean;
  manual: boolean;
};

type Row = Omit<ShoppingItem, "recipes" | "checked" | "manual"> & { recipes: string; checked: number; manual: number };

export function listItems(db: Database.Database, week: string): ShoppingItem[] {
  return (db.prepare("SELECT * FROM shopping_items WHERE week = ? ORDER BY name COLLATE NOCASE").all(week) as Row[]).map(
    (r) => ({ ...r, recipes: r.recipes ? r.recipes.split("\n") : [], checked: r.checked === 1, manual: r.manual === 1 }),
  );
}

/**
 * Replace the generated items of a week with a fresh list. Items you added by
 * hand stay, and anything already ticked off stays ticked.
 */
export function saveGenerated(db: Database.Database, week: string, lines: ShoppingLine[]): void {
  db.transaction(() => {
    const ticked = new Set(
      (db.prepare("SELECT name FROM shopping_items WHERE week = ? AND checked = 1 AND manual = 0").all(week) as { name: string }[]).map(
        (r) => r.name.toLowerCase(),
      ),
    );
    db.prepare("DELETE FROM shopping_items WHERE week = ? AND manual = 0").run(week);
    const insert = db.prepare(
      "INSERT INTO shopping_items (week, name, quantity, unit, recipes, checked) VALUES (?, ?, ?, ?, ?, ?)",
    );
    for (const l of lines) {
      insert.run(week, l.name, l.quantity, l.unit, l.recipes.join("\n"), ticked.has(l.name.toLowerCase()) ? 1 : 0);
    }
  })();
}

export function setChecked(db: Database.Database, id: number, checked: boolean): void {
  db.prepare("UPDATE shopping_items SET checked = ? WHERE id = ?").run(checked ? 1 : 0, id);
}
