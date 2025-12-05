import { parseIngredient } from "@/lib/ingredients/parse";

/** Amount and unit in bold, the rest as typed. */
export function IngredientLine({ line }: { line: string }) {
  const ing = parseIngredient(line);
  if (ing.quantity === null) return <li>{line}</li>;
  const amount = ing.quantityMax ? `${ing.quantity}-${ing.quantityMax}` : String(Math.round(ing.quantity * 100) / 100);
  return (
    <li>
      <strong>
        {amount}
        {ing.unit ? ` ${ing.unit}` : ""}
      </strong>{" "}
      {ing.name}
      {ing.note && <span className="muted">, {ing.note}</span>}
    </li>
  );
}
