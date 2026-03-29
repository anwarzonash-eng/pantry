import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { getRecipeBySlug } from "@/lib/recipes";
import { IngredientList } from "@/components/IngredientList";
import { PrintButton } from "@/components/PrintButton";

export const dynamic = "force-dynamic";

export default async function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(getDb(), slug);
  if (!recipe) notFound();

  return (
    <article className="recipe">
      <div className="page-head">
        <h1>{recipe.title}</h1>
        <span className="actions">
          <PrintButton />
          <a href={`/recipes/${recipe.slug}/markdown`}>Markdown</a>
          <Link href={`/recipes/${recipe.slug}/edit`}>Edit</Link>
        </span>
      </div>
      {recipe.description && <p className="lead">{recipe.description}</p>}
      <p className="muted">Serves {recipe.servings}</p>
      {recipe.tags.length > 0 && (
        <p className="tags">
          {recipe.tags.map((t) => (
            <Link key={t} href={`/?tag=${encodeURIComponent(t)}`} className="tag">
              {t}
            </Link>
          ))}
        </p>
      )}

      <div className="recipe-body">
        <section>
          <h2>Ingredients</h2>
          <IngredientList lines={recipe.ingredients} servings={recipe.servings} />
        </section>
        <section>
          <h2>Steps</h2>
          <ol className="steps">
            {recipe.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          {recipe.notes && (
            <>
              <h2>Notes</h2>
              <p className="notes">{recipe.notes}</p>
            </>
          )}
          {recipe.sourceUrl && (
            <p className="muted source">
              From <a href={recipe.sourceUrl}>{new URL(recipe.sourceUrl).hostname.replace(/^www\./, "")}</a>
            </p>
          )}
        </section>
      </div>
    </article>
  );
}
