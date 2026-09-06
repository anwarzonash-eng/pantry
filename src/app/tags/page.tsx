import Link from "next/link";
import { getDb } from "@/lib/db";
import { listTags } from "@/lib/recipes";
import { remove, rename } from "./actions";

export const dynamic = "force-dynamic";

export default function TagsPage() {
  const tags = listTags(getDb());
  return (
    <section>
      <h1>Tags</h1>
      <p className="muted">Rename a tag to the name of another one to merge them.</p>
      {tags.length === 0 ? (
        <p className="muted">No tags yet. Add some when you edit a recipe.</p>
      ) : (
        <ul className="tag-admin">
          {tags.map((t) => (
            <li key={t.name}>
              <form action={rename.bind(null, t.name)}>
                <input name="name" defaultValue={t.name} aria-label={`Rename ${t.name}`} />
                <button type="submit">Rename</button>
              </form>
              <Link href={`/?tag=${encodeURIComponent(t.name)}`} className="muted">
                {t.count} {t.count === 1 ? "recipe" : "recipes"}
              </Link>
              <form action={remove.bind(null, t.name)} className="push-right">
                <button type="submit" className="remove" aria-label={`Delete tag ${t.name}`}>
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
