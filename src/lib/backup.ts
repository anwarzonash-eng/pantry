import type Database from "better-sqlite3";
import { listPantry } from "./pantry";
import { listRecipes } from "./recipes";

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
    recipes: recipes.map(({ slug, title, description, servings, ingredients, steps, tags }) => ({
      slug, title, description, servings, ingredients, steps, tags,
    })),
    plan: plan
      .filter((m) => slugById.has(m.recipe_id))
      .map((m) => ({ date: m.date, slot: m.slot, recipe: slugById.get(m.recipe_id)!, servings: m.servings })),
    pantry: listPantry(db).map((i) => i.name),
  };
}
