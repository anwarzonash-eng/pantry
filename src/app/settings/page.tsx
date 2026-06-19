import { cookies } from "next/headers";
import { parseSystem, UNIT_COOKIE } from "@/lib/ingredients/units";
import { saveUnits } from "./actions";

export default async function SettingsPage() {
  const current = parseSystem((await cookies()).get(UNIT_COOKIE)?.value) ?? "as-written";
  const options = [
    { value: "as-written", label: "As written in the recipe" },
    { value: "metric", label: "Metric (g, ml)" },
    { value: "imperial", label: "US (cups, oz, lb)" },
  ];
  return (
    <section>
      <h1>Settings</h1>
      <form action={saveUnits} className="recipe-form">
        <fieldset>
          <legend>Show amounts in</legend>
          {options.map((o) => (
            <label key={o.value} className="inline">
              <input type="radio" name="units" value={o.value} defaultChecked={current === o.value} /> {o.label}
            </label>
          ))}
        </fieldset>
        <p className="muted">Teaspoons and tablespoons are never converted. The shopping list uses the same setting.</p>
        <button className="button" type="submit">
          Save
        </button>
      </form>
    </section>
  );
}
