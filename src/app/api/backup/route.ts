import { exportAll } from "@/lib/backup";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export function GET() {
  const backup = exportAll(getDb());
  const day = backup.exportedAt.slice(0, 10);
  return new Response(JSON.stringify(backup, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="pantry-backup-${day}.json"`,
    },
  });
}
