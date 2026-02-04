import type Database from "better-sqlite3";

export const SLOTS = ["breakfast", "lunch", "dinner"] as const;
export type Slot = (typeof SLOTS)[number];

export type PlannedMeal = {
  id: number;
  date: string;
  slot: Slot;
  recipeId: number;
  title: string;
  slug: string;
  /** Servings to cook; null means what the recipe makes. */
  servings: number | null;
  recipeServings: number;
};

export function addToPlan(
  db: Database.Database,
  meal: { date: string; slot: Slot; recipeId: number; servings?: number | null },
): number {
  const { lastInsertRowid } = db
    .prepare("INSERT INTO meal_plan (date, slot, recipe_id, servings) VALUES (?, ?, ?, ?)")
    .run(meal.date, meal.slot, meal.recipeId, meal.servings ?? null);
  return Number(lastInsertRowid);
}

export function removeFromPlan(db: Database.Database, id: number): void {
  db.prepare("DELETE FROM meal_plan WHERE id = ?").run(id);
}

/** Meals from `from` to `to` (inclusive), in date and slot order. */
export function mealsBetween(db: Database.Database, from: string, to: string): PlannedMeal[] {
  const rows = db
    .prepare(
      `SELECT m.id, m.date, m.slot, m.recipe_id AS recipeId, r.title, r.slug,
              m.servings, r.servings AS recipeServings
       FROM meal_plan m JOIN recipes r ON r.id = m.recipe_id
       WHERE m.date BETWEEN ? AND ?
       ORDER BY m.date, CASE m.slot WHEN 'breakfast' THEN 0 WHEN 'lunch' THEN 1 ELSE 2 END, m.id`,
    )
    .all(from, to) as PlannedMeal[];
  return rows;
}
