import type Database from "better-sqlite3";
import { addToPantry, listPantry } from "./pantry";
import { addToPlan, SLOTS, type Slot } from "./plan";
import { createRecipe, listRecipes } from "./recipes";

export const BACKUP_VERSION = 1;

export type Backup = {
  app: "pantry";
  version: number;
  exportedAt: string;
  recipes: {
    slug: string;
    title: string;
    description: string;
    servings: number;
    ingredients: string[];
    steps: string[];
    tags: string[];
    notes?: string;
    sourceUrl?: string;
  }[];
  plan: { date: string; slot: string; recipe: string; servings: number | null }[];
  pantry: string[];
};

/** Everything you typed in, as plain JSON. Shopping lists are left out; they can be made again. */
export function exportAll(db: Database.Database, now = new Date()): Backup {
  const recipes = listRecipes(db);
  const slugById = new Map(recipes.map((r) => [r.id, r.slug]));
  const plan = db.prepare("SELECT date, slot, recipe_id, servings FROM meal_plan ORDER BY date, id").all() as {
    date: string;
    slot: string;
    recipe_id: number;
    servings: number | null;
  }[];
  return {
    app: "pantry",
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    recipes: recipes.map(({ slug, title, description, servings, ingredients, steps, tags, notes, sourceUrl }) => ({
      slug, title, description, servings, ingredients, steps, tags, notes, sourceUrl,
    })),
    plan: plan
      .filter((m) => slugById.has(m.recipe_id))
      .map((m) => ({ date: m.date, slot: m.slot, recipe: slugById.get(m.recipe_id)!, servings: m.servings })),
    pantry: listPantry(db).map((i) => i.name),
  };
}

export class BackupError extends Error {}

/** Check the shape of an uploaded file before touching the database. */
export function parseBackup(text: string): Backup {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new BackupError("That file is not JSON.");
  }
  const b = data as Partial<Backup>;
  if (b?.app !== "pantry" || typeof b.version !== "number") throw new BackupError("That is not a pantry backup.");
  if (b.version > BACKUP_VERSION) throw new BackupError("This backup is from a newer version of pantry.");
  if (!Array.isArray(b.recipes) || !Array.isArray(b.plan) || !Array.isArray(b.pantry)) {
    throw new BackupError("The backup is incomplete.");
  }
  return b as Backup;
}

/**
 * Replace everything with the backup. Runs in one transaction, so a broken
 * file leaves the current data alone.
 */
export function restoreAll(db: Database.Database, backup: Backup): { recipes: number } {
  db.transaction(() => {
    db.exec(`DELETE FROM meal_plan; DELETE FROM shopping_items; DELETE FROM recipe_tags; DELETE FROM tags;
             DELETE FROM recipes; DELETE FROM pantry_items;`);
    const idBySlug = new Map<string, number>();
    for (const r of backup.recipes) {
      const saved = createRecipe(db, r);
      idBySlug.set(r.slug, saved.id);
      if (saved.slug !== r.slug) db.prepare("UPDATE recipes SET slug = ? WHERE id = ?").run(r.slug, saved.id);
    }
    for (const m of backup.plan) {
      const recipeId = idBySlug.get(m.recipe);
      if (recipeId && SLOTS.includes(m.slot as Slot)) {
        addToPlan(db, { date: m.date, slot: m.slot as Slot, recipeId, servings: m.servings });
      }
    }
    addToPantry(db, backup.pantry.join("\n"));
  })();
  return { recipes: backup.recipes.length };
}
