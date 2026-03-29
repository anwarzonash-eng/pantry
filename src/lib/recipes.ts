import type Database from "better-sqlite3";
import { uniqueSlug } from "./slug";

export type Recipe = {
  id: number;
  slug: string;
  title: string;
  description: string;
  servings: number;
  /** One ingredient per line, as typed. */
  ingredients: string[];
  steps: string[];
  tags: string[];
  notes: string;
  sourceUrl: string;
  createdAt: number;
  updatedAt: number;
};

export type RecipeInput = {
  title: string;
  description?: string;
  servings?: number;
  ingredients: string[];
  steps: string[];
  tags?: string[];
  notes?: string;
  sourceUrl?: string;
};

type Row = {
  id: number;
  slug: string;
  title: string;
  description: string;
  servings: number;
  ingredients: string;
  steps: string;
  created_at: number;
  updated_at: number;
  tags: string | null;
  notes: string;
  source_url: string;
};

// recipes with their tags as "a,b,c"
const SELECT = `SELECT r.*, (
  SELECT GROUP_CONCAT(t.name, ',') FROM recipe_tags rt JOIN tags t ON t.id = rt.tag_id
  WHERE rt.recipe_id = r.id ORDER BY t.name
) AS tags FROM recipes r`;

const lines = (text: string) => text.split("\n").map((l) => l.trim()).filter(Boolean);

function toRecipe(row: Row): Recipe {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    servings: row.servings,
    ingredients: lines(row.ingredients),
    steps: lines(row.steps),
    tags: row.tags ? row.tags.split(",").sort((a, b) => a.localeCompare(b)) : [],
    notes: row.notes,
    sourceUrl: row.source_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createRecipe(db: Database.Database, input: RecipeInput, now = Date.now()): Recipe {
  const { lastInsertRowid } = db
    .prepare(
      `INSERT INTO recipes (slug, title, description, servings, ingredients, steps, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      uniqueSlug((s) => db.prepare("SELECT 1 FROM recipes WHERE slug = ?").get(s) !== undefined, input.title),
      input.title.trim(),
      input.description?.trim() ?? "",
      input.servings ?? 2,
      input.ingredients.join("\n"),
      input.steps.join("\n"),
      now,
      now,
    );
  setTags(db, Number(lastInsertRowid), input.tags ?? []);
  saveDetails(db, Number(lastInsertRowid), input);
  return getRecipe(db, Number(lastInsertRowid))!;
}

export function getRecipe(db: Database.Database, id: number): Recipe | null {
  const row = db.prepare(`${SELECT} WHERE r.id = ?`).get(id) as Row | undefined;
  return row ? toRecipe(row) : null;
}

/** The slug stays the same when the title is edited, so links keep working. */
export function getRecipeBySlug(db: Database.Database, slug: string): Recipe | null {
  const row = db.prepare(`${SELECT} WHERE r.slug = ?`).get(slug) as Row | undefined;
  return row ? toRecipe(row) : null;
}

export type RecipeFilter = { tag?: string; q?: string };

export function listRecipes(db: Database.Database, filter: RecipeFilter = {}): Recipe[] {
  const where: string[] = [];
  const params: unknown[] = [];
  if (filter.tag) {
    where.push(
      "EXISTS (SELECT 1 FROM recipe_tags rt JOIN tags t ON t.id = rt.tag_id WHERE rt.recipe_id = r.id AND t.name = ?)",
    );
    params.push(filter.tag);
  }
  // every word has to appear in the title, description or ingredients
  for (const word of (filter.q ?? "").split(/\s+/).filter(Boolean)) {
    where.push("(r.title LIKE ? OR r.description LIKE ? OR r.ingredients LIKE ?)");
    const like = `%${word.replace(/[%_]/g, "")}%`;
    params.push(like, like, like);
  }
  const sql = `${SELECT} ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY r.updated_at DESC`;
  return (db.prepare(sql).all(...params) as Row[]).map(toRecipe);
}

export function updateRecipe(db: Database.Database, id: number, input: RecipeInput, now = Date.now()): Recipe | null {
  db.prepare(
    `UPDATE recipes SET title = ?, description = ?, servings = ?, ingredients = ?, steps = ?, updated_at = ?
     WHERE id = ?`,
  ).run(
    input.title.trim(),
    input.description?.trim() ?? "",
    input.servings ?? 2,
    input.ingredients.join("\n"),
    input.steps.join("\n"),
    now,
    id,
  );
  if (input.tags) setTags(db, id, input.tags);
  saveDetails(db, id, input);
  return getRecipe(db, id);
}

/** Optional fields, kept apart so the main insert stays readable. */
function saveDetails(db: Database.Database, id: number, input: RecipeInput): void {
  db.prepare("UPDATE recipes SET notes = ?, source_url = ? WHERE id = ?").run(
    input.notes?.trim() ?? "",
    cleanUrl(input.sourceUrl),
    id,
  );
}

/** Only keep http(s) links, so nothing odd ends up in an href. */
export function cleanUrl(text: string | undefined): string {
  const value = text?.trim() ?? "";
  try {
    return ["http:", "https:"].includes(new URL(value).protocol) ? value : "";
  } catch {
    return "";
  }
}

export function deleteRecipe(db: Database.Database, id: number): boolean {
  return db.prepare("DELETE FROM recipes WHERE id = ?").run(id).changes > 0;
}

/** "Dinner, quick , dinner" -> ["Dinner", "quick"] */
export function parseTags(text: string): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const t of text.split(",").map((s) => s.trim()).filter(Boolean)) {
    if (!seen.has(t.toLowerCase())) {
      seen.add(t.toLowerCase());
      tags.push(t);
    }
  }
  return tags;
}

export function setTags(db: Database.Database, recipeId: number, names: string[]): void {
  db.transaction(() => {
    db.prepare("DELETE FROM recipe_tags WHERE recipe_id = ?").run(recipeId);
    for (const name of names) {
      db.prepare("INSERT INTO tags (name) VALUES (?) ON CONFLICT (name) DO NOTHING").run(name);
      const tag = db.prepare("SELECT id FROM tags WHERE name = ?").get(name) as { id: number };
      db.prepare("INSERT OR IGNORE INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)").run(recipeId, tag.id);
    }
  })();
}

export function listTags(db: Database.Database): { name: string; count: number }[] {
  return db
    .prepare(
      `SELECT t.name, COUNT(*) AS count FROM tags t JOIN recipe_tags rt ON rt.tag_id = t.id
       GROUP BY t.id ORDER BY t.name COLLATE NOCASE`,
    )
    .all() as { name: string; count: number }[];
}
