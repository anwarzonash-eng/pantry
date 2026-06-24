import type Database from "better-sqlite3";
import { addDays } from "./dates";

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

/**
 * Copy the meals of the week starting `fromMonday` to the week starting
 * `toMonday`. Slots that already have something are left alone.
 */
export function copyWeek(db: Database.Database, fromMonday: string, toMonday: string): number {
  const source = mealsBetween(db, fromMonday, addDays(fromMonday, 6));
  const target = mealsBetween(db, toMonday, addDays(toMonday, 6));
  const taken = new Set(target.map((m) => `${m.date}|${m.slot}`));
  const offset = Math.round((Date.parse(toMonday) - Date.parse(fromMonday)) / 86_400_000);
  let copied = 0;
  db.transaction(() => {
    for (const m of source) {
      const date = addDays(m.date, offset);
      if (taken.has(`${date}|${m.slot}`)) continue;
      addToPlan(db, { date, slot: m.slot, recipeId: m.recipeId, servings: m.servings });
      copied++;
    }
  })();
  return copied;
}

/**
 * Dinner ideas: recipes you have not planned for the longest time (never
 * planned first), favourites before the rest. Only recipes tagged "dinner"
 * when you have any.
 */
export function suggestDinners(db: Database.Database, before: string, count = 3): { id: number; title: string; slug: string }[] {
  const tagged = db
    .prepare("SELECT COUNT(*) AS n FROM recipe_tags rt JOIN tags t ON t.id = rt.tag_id WHERE t.name = 'dinner'")
    .get() as { n: number };
  const onlyDinner = tagged.n > 0
    ? "AND EXISTS (SELECT 1 FROM recipe_tags rt JOIN tags t ON t.id = rt.tag_id WHERE rt.recipe_id = r.id AND t.name = 'dinner')"
    : "";
  return db
    .prepare(
      `SELECT r.id, r.title, r.slug, (SELECT MAX(date) FROM meal_plan m WHERE m.recipe_id = r.id AND m.date < ?) AS last
       FROM recipes r WHERE 1 = 1 ${onlyDinner}
       ORDER BY last IS NOT NULL, last, r.favorite DESC, r.title COLLATE NOCASE
       LIMIT ?`,
    )
    .all(before, count) as { id: number; title: string; slug: string }[];
}
