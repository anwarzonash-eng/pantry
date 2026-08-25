import Link from "next/link";
import { getDb } from "@/lib/db";
import { toISODate } from "@/lib/dates";
import { cookingStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default function StatsPage() {
  const s = cookingStats(getDb(), toISODate(new Date()));
  return (
    <section>
      <h1>What you cook</h1>
      <p className="muted">
        {s.recipes} recipes, {s.planned} meals planned so far.
      </p>
      <div className="two-col">
        <div>
          <h2>Most planned</h2>
          {s.mostPlanned.length === 0 ? (
            <p className="muted">Plan some meals and this fills up.</p>
          ) : (
            <ol>
              {s.mostPlanned.map((r) => (
                <li key={r.slug}>
                  <Link href={`/recipes/${r.slug}`}>{r.title}</Link> <span className="muted">×{r.times}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div>
          <h2>Never planned</h2>
          {s.neverPlanned.length === 0 ? (
            <p className="muted">You have cooked everything at least once.</p>
          ) : (
            <ul>
              {s.neverPlanned.map((r) => (
                <li key={r.slug}>
                  <Link href={`/recipes/${r.slug}`}>{r.title}</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
