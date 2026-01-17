import Link from "next/link";
import { getDb } from "@/lib/db";
import { formatDay, startOfWeek, toISODate, weekDays } from "@/lib/dates";
import { mealsBetween, SLOTS } from "@/lib/plan";
import { listRecipes } from "@/lib/recipes";
import { AddMeal } from "./AddMeal";
import { unplanMeal } from "./actions";

export const dynamic = "force-dynamic";

export default function PlanPage() {
  const monday = startOfWeek(toISODate(new Date()));
  const days = weekDays(monday);
  const db = getDb();
  const meals = mealsBetween(db, days[0], days[6]);
  const recipes = listRecipes(db)
    .map((r) => ({ id: r.id, title: r.title }))
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <section>
      <h1>Week of {formatDay(monday)}</h1>
      <div className="week">
        {days.map((day) => (
          <div key={day} className="day">
            <h2>{formatDay(day)}</h2>
            {SLOTS.map((slot) => (
              <div key={slot} className="slot">
                <span className="slot-name">{slot}</span>
                {meals
                  .filter((m) => m.date === day && m.slot === slot)
                  .map((m) => (
                    <div key={m.id} className="meal">
                      <Link href={`/recipes/${m.slug}`}>{m.title}</Link>
                      <form action={unplanMeal.bind(null, m.id)}>
                        <button type="submit" className="remove" aria-label={`Remove ${m.title}`}>
                          ×
                        </button>
                      </form>
                    </div>
                  ))}
                <AddMeal date={day} slot={slot} recipes={recipes} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
