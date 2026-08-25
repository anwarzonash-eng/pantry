import type Database from "better-sqlite3";

export type Stats = {
  recipes: number;
  planned: number;
  mostPlanned: { title: string; slug: string; times: number }[];
  neverPlanned: { title: string; slug: string }[];
};

/** What you actually cook, from the plan history up to `until`. */
export function cookingStats(db: Database.Database, until: string): Stats {
  const count = (sql: string, ...args: unknown[]) => (db.prepare(sql).get(...args) as { n: number }).n;
  return {
    recipes: count("SELECT COUNT(*) AS n FROM recipes"),
    planned: count("SELECT COUNT(*) AS n FROM meal_plan WHERE date <= ?", until),
    mostPlanned: db
      .prepare(
        `SELECT r.title, r.slug, COUNT(*) AS times FROM meal_plan m JOIN recipes r ON r.id = m.recipe_id
         WHERE m.date <= ? GROUP BY r.id ORDER BY times DESC, r.title COLLATE NOCASE LIMIT 10`,
      )
      .all(until) as Stats["mostPlanned"],
    neverPlanned: db
      .prepare(
        `SELECT title, slug FROM recipes WHERE id NOT IN (SELECT recipe_id FROM meal_plan)
         ORDER BY created_at DESC LIMIT 20`,
      )
      .all() as Stats["neverPlanned"],
  };
}
