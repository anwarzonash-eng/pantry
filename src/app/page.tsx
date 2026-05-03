import Link from "next/link";
import { getDb } from "@/lib/db";
import { listRecipes, listTags, SORTS, type Sort } from "@/lib/recipes";
import { formatMinutes, totalMinutes } from "@/lib/time";

export const dynamic = "force-dynamic";

type Search = { tag?: string; q?: string; sort?: string; fav?: string };

const SORT_LABELS: Record<Sort, string> = { recent: "Recently changed", title: "A–Z", quick: "Quickest" };

export default async function Home({ searchParams }: { searchParams: Promise<Search> }) {
  const { tag, q, sort: sortParam, fav } = await searchParams;
  const favorites = fav === "1";
  const sort = (sortParam && sortParam in SORTS ? sortParam : "recent") as Sort;
  const db = getDb();
  const recipes = listRecipes(db, { tag, q, sort, favorites });
  const tags = listTags(db);

  return (
    <section>
      <div className="page-head">
        <h1>Recipes</h1>
        <Link href="/recipes/new" className="button">
          New recipe
        </Link>
      </div>

      <form className="search" action="/">
        <input name="q" type="search" placeholder="Search recipes or ingredients" defaultValue={q} />
        {tag && <input type="hidden" name="tag" value={tag} />}
        <select name="sort" defaultValue={sort} aria-label="Sort">
          {(Object.keys(SORT_LABELS) as Sort[]).map((s) => (
            <option key={s} value={s}>
              {SORT_LABELS[s]}
            </option>
          ))}
        </select>
        <button type="submit">Go</button>
      </form>

      {tags.length > 0 && (
        <p className="tags">
          <Link href="/" className={`tag ${tag || favorites ? "" : "active"}`}>
            all
          </Link>
          <Link href="/?fav=1" className={`tag ${favorites ? "active" : ""}`}>
            ★ favourites
          </Link>
          {tags.map((t) => (
            <Link
              key={t.name}
              href={`/?tag=${encodeURIComponent(t.name)}`}
              className={`tag ${tag?.toLowerCase() === t.name.toLowerCase() ? "active" : ""}`}
            >
              {t.name} <span className="count">{t.count}</span>
            </Link>
          ))}
        </p>
      )}

      {recipes.length === 0 && !q && !tag && !favorites ? (
        <div className="empty">
          <h2>Your recipe box is empty</h2>
          <p>Start by typing in a recipe you cook often, or paste one in Markdown.</p>
          <p>
            <Link href="/recipes/new" className="button">
              Add a recipe
            </Link>{" "}
            <Link href="/import">Import</Link>
          </p>
          <p className="muted">
            Trying it out? <code>npm run seed</code> adds a few sample recipes.
          </p>
        </div>
      ) : recipes.length === 0 ? (
        <p className="muted">
          {q ? `Nothing matches “${q}”.` : favorites ? "No favourites yet. Tap ☆ on a recipe." : `No recipes tagged “${tag}”.`}
        </p>
      ) : (
        <ul className="recipe-list">
          {recipes.map((r) => (
            <li key={r.id}>
              <Link href={`/recipes/${r.slug}`}>
                {r.favorite && <span className="star">★ </span>}
                {r.title}
              </Link>
              {totalMinutes(r) && <span className="muted time"> · {formatMinutes(totalMinutes(r)!)}</span>}
              {r.description && <p className="muted">{r.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
