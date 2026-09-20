import { planMeal } from "./actions";

type Props = { date: string; slot: string; recipes: { id: number; title: string }[] };

export function AddMeal({ date, slot, recipes }: Props) {
  return (
    <form action={planMeal} className="add-meal no-print">
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="slot" value={slot} />
      <select name="recipeId" defaultValue="" aria-label={`Add ${slot} on ${date}`} required>
        <option value="" disabled>
          + add
        </option>
        {recipes.map((r) => (
          <option key={r.id} value={r.id}>
            {r.title}
          </option>
        ))}
      </select>
      <input name="servings" type="number" min={1} max={50} placeholder="×" aria-label="Servings" className="servings" />
      <button type="submit">Add</button>
    </form>
  );
}
