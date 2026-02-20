import Link from "next/link";
import { getDb } from "@/lib/db";
import { addDays, formatDay, isISODate, startOfWeek, toISODate } from "@/lib/dates";
import { formatQuantity } from "@/lib/ingredients/format";
import { shoppingForWeek } from "@/lib/shopping/fromPlan";

export const dynamic = "force-dynamic";

export default async function ShoppingPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const { week } = await searchParams;
  const monday = startOfWeek(isISODate(week) ? week : toISODate(new Date()));
  const lines = shoppingForWeek(getDb(), monday);

  return (
    <section>
      <div className="page-head">
        <h1>Shopping for {formatDay(monday)}</h1>
        <nav className="week-nav">
          <Link href={`/shopping?week=${addDays(monday, -7)}`}>← Previous</Link>
          <Link href={`/shopping?week=${addDays(monday, 7)}`}>Next →</Link>
        </nav>
      </div>
      {lines.length === 0 ? (
        <p className="muted">
          Nothing planned this week. <Link href={`/plan?week=${monday}`}>Plan some meals</Link>.
        </p>
      ) : (
        <ul className="shopping">
          {lines.map((l) => (
            <li key={`${l.name}|${l.unit}`}>
              <strong>
                {l.quantity !== null && formatQuantity(l.quantity)} {l.unit}
              </strong>{" "}
              {l.name}
              <span className="muted"> · {l.recipes.join(", ")}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
