// Write a JSON backup to backups/ (or the folder given): npm run backup -- /path/to/folder
// Handy from cron:  0 3 * * * cd /opt/pantry && npm run backup
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { exportAll } from "../src/lib/backup";
import { getDb } from "../src/lib/db";

const KEEP = 14;
const dir = path.resolve(process.argv[2] ?? "backups");
mkdirSync(dir, { recursive: true });

const backup = exportAll(getDb());
const file = path.join(dir, `pantry-${backup.exportedAt.replace(/[:.]/g, "-")}.json`);
writeFileSync(file, JSON.stringify(backup, null, 2));
console.log(`wrote ${file} (${backup.recipes.length} recipes)`);

// keep the newest few
const old = readdirSync(dir).filter((f) => /^pantry-.*\.json$/.test(f)).sort().slice(0, -KEEP);
for (const f of old) rmSync(path.join(dir, f));
if (old.length) console.log(`removed ${old.length} old backup(s)`);
