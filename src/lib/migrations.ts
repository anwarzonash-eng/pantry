import type Database from "better-sqlite3";
import { fold } from "./fold";
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

  // 6: saved shopping lists, one per week
  `CREATE TABLE shopping_items (
    id INTEGER PRIMARY KEY,
    week TEXT NOT NULL,
    name TEXT NOT NULL,
    quantity REAL,
    unit TEXT,
    recipes TEXT NOT NULL DEFAULT '',
    checked INTEGER NOT NULL DEFAULT 0,
    manual INTEGER NOT NULL DEFAULT 0
  );
  CREATE INDEX shopping_items_week ON shopping_items (week);`,

  // 7: things already at home
  `CREATE TABLE pantry_items (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE,
    added_at INTEGER NOT NULL
  );`,

  // 8: remember which generated items were skipped because they are in the pantry
  `ALTER TABLE shopping_items ADD COLUMN in_pantry INTEGER NOT NULL DEFAULT 0;`,

  // 9: where a recipe came from, and notes for next time
  `ALTER TABLE recipes ADD COLUMN notes TEXT NOT NULL DEFAULT '';
   ALTER TABLE recipes ADD COLUMN source_url TEXT NOT NULL DEFAULT '';`,

  // 10: how long it takes
  `ALTER TABLE recipes ADD COLUMN prep_minutes INTEGER;
   ALTER TABLE recipes ADD COLUMN cook_minutes INTEGER;`,

  // 11: favourites
  `ALTER TABLE recipes ADD COLUMN favorite INTEGER NOT NULL DEFAULT 0;`,

  // 12: a photo, by link
  `ALTER TABLE recipes ADD COLUMN image_url TEXT NOT NULL DEFAULT '';`,

  // 13: deleting a recipe left its plan entries and tag links behind.
  // SQLite cannot add a foreign key to an existing table, so rebuild the two
  // tables with ON DELETE CASCADE and drop rows that already point nowhere.
  `CREATE TABLE meal_plan_new (
    id INTEGER PRIMARY KEY,
    date TEXT NOT NULL,
    slot TEXT NOT NULL CHECK (slot IN ('breakfast', 'lunch', 'dinner')),
    recipe_id INTEGER NOT NULL REFERENCES recipes (id) ON DELETE CASCADE,
    servings INTEGER
  );
  INSERT INTO meal_plan_new SELECT id, date, slot, recipe_id, servings FROM meal_plan
    WHERE recipe_id IN (SELECT id FROM recipes);
  DROP TABLE meal_plan;
  ALTER TABLE meal_plan_new RENAME TO meal_plan;

  CREATE TABLE recipe_tags_new (
    recipe_id INTEGER NOT NULL REFERENCES recipes (id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
    PRIMARY KEY (recipe_id, tag_id)
  );
  INSERT INTO recipe_tags_new SELECT recipe_id, tag_id FROM recipe_tags
    WHERE recipe_id IN (SELECT id FROM recipes) AND tag_id IN (SELECT id FROM tags);
  DROP TABLE recipe_tags;
  ALTER TABLE recipe_tags_new RENAME TO recipe_tags;
  DELETE FROM tags WHERE id NOT IN (SELECT tag_id FROM recipe_tags);`,

  // 14: indexes for the queries every page runs
  `CREATE INDEX meal_plan_date ON meal_plan (date);
   CREATE INDEX meal_plan_recipe ON meal_plan (recipe_id);
   CREATE INDEX recipe_tags_tag ON recipe_tags (tag_id);
   CREATE INDEX recipes_updated ON recipes (updated_at);`,
];

/** SQL helpers the queries rely on; registered on every connection. */
export function registerFunctions(db: Database.Database): void {
  db.function("fold", { deterministic: true }, (value: unknown) => (typeof value === "string" ? fold(value) : value));
}

export function migrate(db: Database.Database): void {
  registerFunctions(db);
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
