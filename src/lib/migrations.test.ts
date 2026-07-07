import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { migrate } from "./migrations";

describe("migrations", () => {
  it("run once and are idempotent", () => {
    const db = new Database(":memory:");
    migrate(db);
    const version = db.pragma("user_version", { simple: true });
    migrate(db);
    expect(db.pragma("user_version", { simple: true })).toBe(version);
  });

  it("the plan query uses the date index", () => {
    const db = new Database(":memory:");
    migrate(db);
    const plan = db
      .prepare("EXPLAIN QUERY PLAN SELECT * FROM meal_plan WHERE date BETWEEN ? AND ?")
      .all("2026-01-01", "2026-01-07") as { detail: string }[];
    expect(plan.map((p) => p.detail).join(" ")).toMatch(/meal_plan_date/);
  });
});
