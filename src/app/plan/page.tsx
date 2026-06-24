import Link from "next/link";
import { getDb } from "@/lib/db";
import { addDays, formatDay, isISODate, startOfWeek, toISODate, weekDays } from "@/lib/dates";
import { mealsBetween, SLOTS, suggestDinners } from "@/lib/plan";
import { listRecipes } from "@/lib/recipes";
import { AddMeal } from "./AddMeal";
import { copyLastWeek, unplanMeal } from "./actions";

export const dynamic = "force-dynamic";

export default async function PlanPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const { week } = await searchParams;
  const today = toISODate(new Date());
  const monday = startOfWeek(isISODate(week) ? week : today);
  const days = weekDays(monday);
  const db = getDb();
  const meals = mealsBetween(db, days[0], days[6]);
  const emptyDinners = days.filter((d) => !meals.some((m) => m.date === d && m.slot === "dinner")).length;
  const ideas = emptyDinners > 0 ? suggestDinners(db, monday, 3) : [];
  const recipes = listRecipes(db)
    .map((r) => ({ id: r.id, title: r.title }))
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <section>
      <div className="page-head">
        <h1>Week of {formatDay(monday)}</h1>
        <nav className="week-nav">
          <Link href={`/plan?week=${addDays(monday, -7)}`}>← Previous</Link>
          <Link href="/plan">This week</Link>
          <Link href={`/plan?week=${addDays(monday, 7)}`}>Next →</Link>
        </nav>
      </div>
      {recipes.length === 0 && (
        <p className="empty">
          Add a few <Link href="/recipes/new">recipes</Link> first, then plan them here.
        </p>
      )}
      {recipes.length > 0 && meals.length === 0 && (
        <form action={copyLastWeek.bind(null, monday)} className="toolbar">
          <span className="muted">Nothing planned this week yet.</span>
          <button type="submit" className="link-button">
            Copy last week
          </button>
        </form>
      )}
      {ideas.length > 0 && (
        <p className="ideas">
          <span className="muted">Not had in a while: </span>
          {ideas.map((r, i) => (
            <span key={r.id}>
              {i > 0 && ", "}
              <Link href={`/recipes/${r.slug}`}>{r.title}</Link>
            </span>
          ))}
        </p>
      )}
      <div className="week">
        {days.map((day) => (
          <div key={day} className={`day ${day === today ? "today" : ""}`}>
            <h2>{formatDay(day)}</h2>
            {SLOTS.map((slot) => (
              <div key={slot} className="slot">
                <span className="slot-name">{slot}</span>
                {meals
                  .filter((m) => m.date === day && m.slot === slot)
                  .map((m) => (
                    <div key={m.id} className="meal">
                      <Link href={`/recipes/${m.slug}`}>
                        {m.title}
                        {m.servings && m.servings !== m.recipeServings && <span className="muted"> ×{m.servings}</span>}
                      </Link>
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
