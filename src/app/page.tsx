import Link from "next/link";
import { getDb } from "@/lib/db";
import { listRecipes } from "@/lib/recipes";

export const dynamic = "force-dynamic";

export default function Home() {
  const recipes = listRecipes(getDb());
  return (
    <section>
      <div className="page-head">
        <h1>Recipes</h1>
        <Link href="/recipes/new" className="button">New recipe</Link>
      </div>
      {recipes.length === 0 ? (
        <p className="muted">No recipes yet.</p>
      ) : (
        <ul className="recipe-list">
          {recipes.map((r) => (
            <li key={r.id}>
              <Link href={`/recipes/${r.slug}`}>{r.title}</Link>
              {r.description && <p className="muted">{r.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
