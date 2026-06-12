import Link from "next/link";
import { getDb } from "@/lib/db";
import { addDays, formatDay, isISODate, startOfWeek, toISODate } from "@/lib/dates";
import { formatQuantity } from "@/lib/ingredients/format";
import { groupByAisle } from "@/lib/shopping/aisles";
import { listItems, type ShoppingItem } from "@/lib/shopping/list";
import { addItem, deleteItem, generateList, toggleItem } from "./actions";
import { CopyButton } from "./CopyButton";
import { listAsText } from "@/lib/shopping/text";

export const dynamic = "force-dynamic";

export default async function ShoppingPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const { week } = await searchParams;
  const monday = startOfWeek(isISODate(week) ? week : toISODate(new Date()));
  const all = listItems(getDb(), monday);
  const items = all.filter((i) => !i.inPantry);
  const have = all.filter((i) => i.inPantry);
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
        {left > 0 && <CopyButton text={listAsText(items)} />}
      </form>

      <form action={addItem.bind(null, monday)} className="add-item">
        <input name="item" placeholder="Add something else, e.g. 2 lemons or dish soap" aria-label="Add an item" />
        <button type="submit">Add</button>
      </form>

      {items.length === 0 ? (
        <p className="muted">
          No list yet. Plan some meals on the <Link href={`/plan?week=${monday}`}>week plan</Link>, then make the list.
        </p>
      ) : (
        groupByAisle(items).map((group) => (
          <div key={group.aisle} className="aisle">
            <h2>{group.aisle}</h2>
            <ItemList items={group.items} />
          </div>
        ))
      )}

      {have.length > 0 && (
        <details className="have">
          <summary>
            {have.length} {have.length === 1 ? "thing" : "things"} you already have (<Link href="/pantry">pantry</Link>)
          </summary>
          <p className="muted">{have.map((i) => i.name).join(", ")}</p>
        </details>
      )}
    </section>
  );
}

function ItemList({ items }: { items: ShoppingItem[] }) {
  return (
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
              {item.manual && (
                <form action={deleteItem.bind(null, item.id)} className="push-right">
                  <button type="submit" className="remove" aria-label={`Remove ${item.name}`}>
                    ×
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
  );
}
