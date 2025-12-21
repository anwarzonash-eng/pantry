import Link from "next/link";
import { getDb } from "@/lib/db";
import { listRecipes, listTags } from "@/lib/recipes";

export const dynamic = "force-dynamic";

type Search = { tag?: string };

export default async function Home({ searchParams }: { searchParams: Promise<Search> }) {
  const { tag } = await searchParams;
  const db = getDb();
  const recipes = listRecipes(db, { tag });
  const tags = listTags(db);

  return (
    <section>
      <div className="page-head">
        <h1>Recipes</h1>
        <Link href="/recipes/new" className="button">
          New recipe
        </Link>
      </div>

      {tags.length > 0 && (
        <p className="tags">
          <Link href="/" className={`tag ${tag ? "" : "active"}`}>
            all
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

      {recipes.length === 0 ? (
        <p className="muted">{tag ? `No recipes tagged “${tag}”.` : "No recipes yet."}</p>
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
