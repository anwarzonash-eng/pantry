import type Database from "better-sqlite3";

// Append only. Each entry runs once, tracked with PRAGMA user_version.
const MIGRATIONS: string[] = [
  `CREATE TABLE recipes (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    servings INTEGER NOT NULL DEFAULT 2,
    ingredients TEXT NOT NULL DEFAULT '',
    steps TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );`,
];

export function migrate(db: Database.Database): void {
  const version = db.pragma("user_version", { simple: true }) as number;
  for (let i = version; i < MIGRATIONS.length; i++) {
    db.transaction(() => {
      db.exec(MIGRATIONS[i]);
      db.pragma(`user_version = ${i + 1}`);
    })();
  }
}
