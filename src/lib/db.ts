import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { migrate } from "./migrations";

let db: Database.Database | undefined;

/** Where pantry.db lives: $DATA_DIR, or ./data next to the app. */
export function dataDir(env: Record<string, string | undefined> = process.env): string {
  return env.DATA_DIR ? path.resolve(env.DATA_DIR) : path.join(process.cwd(), "data");
}

/** The app's database, created and migrated on first use. */
export function getDb(): Database.Database {
  if (!db) {
    const dir = dataDir();
    mkdirSync(dir, { recursive: true });
    db = new Database(path.join(dir, "pantry.db"));
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    migrate(db);
  }
  return db;
}
