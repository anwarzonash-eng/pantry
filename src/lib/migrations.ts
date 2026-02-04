import type Database from "better-sqlite3";
import { uniqueSlug } from "./slug";

type Migration = string | ((db: Database.Database) => void);

// Append only. Each entry runs once, tracked with PRAGMA user_version.
const MIGRATIONS: Migration[] = [
  `CREATE TABLE recipes (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    servings INTEGER NOT NULL DEFAULT 2,
    ingredients TEXT NOT NULL DEFAULT '',
    steps TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );`,

  // 2: slugs for nicer URLs
  (db) => {
    db.exec("ALTER TABLE recipes ADD COLUMN slug TEXT");
    const used = new Set<string>();
    const rows = db.prepare("SELECT id, title FROM recipes ORDER BY id").all() as { id: number; title: string }[];
    for (const row of rows) {
      const slug = uniqueSlug((s) => used.has(s), row.title);
      used.add(slug);
      db.prepare("UPDATE recipes SET slug = ? WHERE id = ?").run(slug, row.id);
    }
    db.exec("CREATE UNIQUE INDEX recipes_slug ON recipes (slug)");
  },

  // 3: tags
  `CREATE TABLE tags (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE
  );
  CREATE TABLE recipe_tags (
    recipe_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (recipe_id, tag_id)
  );`,

  // 4: meal plan
  `CREATE TABLE meal_plan (
    id INTEGER PRIMARY KEY,
    date TEXT NOT NULL,
    slot TEXT NOT NULL CHECK (slot IN ('breakfast', 'lunch', 'dinner')),
    recipe_id INTEGER NOT NULL
  );`,

  // 5: cook a different amount than the recipe makes (null = as written)
  `ALTER TABLE meal_plan ADD COLUMN servings INTEGER;`,
];

export function migrate(db: Database.Database): void {
  const version = db.pragma("user_version", { simple: true }) as number;
  for (let i = version; i < MIGRATIONS.length; i++) {
    db.transaction(() => {
      const m = MIGRATIONS[i];
      if (typeof m === "string") db.exec(m);
      else m(db);
      db.pragma(`user_version = ${i + 1}`);
    })();
  }
}
