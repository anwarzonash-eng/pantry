import type Database from "better-sqlite3";
import { normalizeName } from "./ingredients/names";

export type PantryItem = { id: number; name: string; addedAt: number };

export function listPantry(db: Database.Database): PantryItem[] {
  return db
    .prepare("SELECT id, name, added_at AS addedAt FROM pantry_items ORDER BY name COLLATE NOCASE")
    .all() as PantryItem[];
}

/** Add one or more items ("rice, olive oil, salt"); existing ones are ignored. */
export function addToPantry(db: Database.Database, text: string, now = Date.now()): number {
  const names = text.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
  const insert = db.prepare("INSERT OR IGNORE INTO pantry_items (name, added_at) VALUES (?, ?)");
  let added = 0;
  db.transaction(() => {
    for (const name of names) added += insert.run(name, now).changes;
  })();
  return added;
}

export function removeFromPantry(db: Database.Database, id: number): void {
  db.prepare("DELETE FROM pantry_items WHERE id = ?").run(id);
}

/** Is this ingredient name in the pantry? */
export function pantryMatcher(db: Database.Database): (name: string) => boolean {
  // "tomato" in the pantry covers "tomatoes" in a recipe
  const names = new Set(listPantry(db).map((i) => normalizeName(i.name)));
  return (name) => names.has(normalizeName(name));
}
