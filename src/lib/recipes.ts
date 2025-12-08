import type Database from "better-sqlite3";

export type Recipe = {
  id: number;
  title: string;
  description: string;
  servings: number;
  /** One ingredient per line, as typed. */
  ingredients: string[];
  steps: string[];
  createdAt: number;
  updatedAt: number;
};

export type RecipeInput = {
  title: string;
  description?: string;
  servings?: number;
  ingredients: string[];
  steps: string[];
};

type Row = {
  id: number;
  title: string;
  description: string;
  servings: number;
  ingredients: string;
  steps: string;
  created_at: number;
  updated_at: number;
};

const lines = (text: string) => text.split("\n").map((l) => l.trim()).filter(Boolean);

function toRecipe(row: Row): Recipe {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    servings: row.servings,
    ingredients: lines(row.ingredients),
    steps: lines(row.steps),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createRecipe(db: Database.Database, input: RecipeInput, now = Date.now()): Recipe {
  const { lastInsertRowid } = db
    .prepare(
      `INSERT INTO recipes (title, description, servings, ingredients, steps, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.title.trim(),
      input.description?.trim() ?? "",
      input.servings ?? 2,
      input.ingredients.join("\n"),
      input.steps.join("\n"),
      now,
      now,
    );
  return getRecipe(db, Number(lastInsertRowid))!;
}

export function getRecipe(db: Database.Database, id: number): Recipe | null {
  const row = db.prepare("SELECT * FROM recipes WHERE id = ?").get(id) as Row | undefined;
  return row ? toRecipe(row) : null;
}

export function listRecipes(db: Database.Database): Recipe[] {
  return (db.prepare("SELECT * FROM recipes ORDER BY updated_at DESC").all() as Row[]).map(toRecipe);
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
  return getRecipe(db, id);
}

export function deleteRecipe(db: Database.Database, id: number): boolean {
  return db.prepare("DELETE FROM recipes WHERE id = ?").run(id).changes > 0;
}
