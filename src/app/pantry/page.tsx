import { getDb } from "@/lib/db";
import { listPantry } from "@/lib/pantry";
import { addPantryItems, removePantryItem } from "./actions";

export const dynamic = "force-dynamic";

export default function PantryPage() {
  const items = listPantry(getDb());
  return (
    <section>
      <h1>Pantry</h1>
      <p className="muted">Things you already have. They are left off the shopping list.</p>
      <form action={addPantryItems} className="add-item">
        <input name="items" placeholder="rice, olive oil, salt" aria-label="Add pantry items" />
        <button type="submit">Add</button>
      </form>
      {items.length === 0 ? (
        <p className="muted">Nothing yet. Start with the staples you always keep.</p>
      ) : (
        <ul className="pantry">
          {items.map((item) => (
            <li key={item.id}>
              {item.name}
              <form action={removePantryItem.bind(null, item.id)}>
                <button type="submit" className="remove" aria-label={`Remove ${item.name}`}>
                  ×
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
