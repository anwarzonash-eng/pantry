import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { migrate } from "./migrations";

let db: Database.Database | undefined;

/** The app's database, created and migrated on first use. */
export function getDb(): Database.Database {
  if (!db) {
    const dir = path.join(process.cwd(), "data");
    mkdirSync(dir, { recursive: true });
    db = new Database(path.join(dir, "pantry.db"));
    db.pragma("journal_mode = WAL");
    migrate(db);
  }
  return db;
}
