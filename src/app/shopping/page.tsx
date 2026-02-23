import Link from "next/link";
import { getDb } from "@/lib/db";
import { addDays, formatDay, isISODate, startOfWeek, toISODate } from "@/lib/dates";
import { formatQuantity } from "@/lib/ingredients/format";
import { listItems } from "@/lib/shopping/list";
import { generateList, toggleItem } from "./actions";

export const dynamic = "force-dynamic";

export default async function ShoppingPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const { week } = await searchParams;
  const monday = startOfWeek(isISODate(week) ? week : toISODate(new Date()));
  const items = listItems(getDb(), monday);
  const left = items.filter((i) => !i.checked).length;

  return (
    <section>
      <div className="page-head">
        <h1>Shopping for {formatDay(monday)}</h1>
        <nav className="week-nav">
          <Link href={`/shopping?week=${addDays(monday, -7)}`}>← Previous</Link>
          <Link href={`/shopping?week=${addDays(monday, 7)}`}>Next →</Link>
        </nav>
      </div>

      <form action={generateList.bind(null, monday)} className="toolbar">
        <button type="submit" className="button">
          {items.length ? "Update from the plan" : "Make list from the plan"}
        </button>
        {items.length > 0 && <span className="muted">{left} left to buy</span>}
      </form>

      {items.length === 0 ? (
        <p className="muted">
          No list yet. Plan some meals on the <Link href={`/plan?week=${monday}`}>week plan</Link>, then make the list.
        </p>
      ) : (
        <ul className="shopping">
          {items.map((item) => (
            <li key={item.id} className={item.checked ? "checked" : ""}>
              <form action={toggleItem.bind(null, item.id, !item.checked)}>
                <button type="submit" className="check" aria-pressed={item.checked} aria-label={`Tick ${item.name}`}>
                  {item.checked ? "✓" : ""}
                </button>
              </form>
              <span>
                <strong>
                  {item.quantity !== null && formatQuantity(item.quantity)} {item.unit}
                </strong>{" "}
                {item.name}
                {item.recipes.length > 0 && <span className="muted"> · {item.recipes.join(", ")}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
