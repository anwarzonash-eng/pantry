import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { getRecipeBySlug } from "@/lib/recipes";
import { IngredientLine } from "@/components/IngredientLine";

export const dynamic = "force-dynamic";

export default async function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(getDb(), slug);
  if (!recipe) notFound();

  return (
    <article className="recipe">
      <div className="page-head">
        <h1>{recipe.title}</h1>
        <Link href={`/recipes/${recipe.slug}/edit`}>Edit</Link>
      </div>
      {recipe.description && <p className="lead">{recipe.description}</p>}
      <p className="muted">Serves {recipe.servings}</p>
      {recipe.tags.length > 0 && (
        <p className="tags">
          {recipe.tags.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </p>
      )}

      <div className="recipe-body">
        <section>
          <h2>Ingredients</h2>
          <ul className="ingredients">
            {recipe.ingredients.map((line, i) => (
              <IngredientLine key={i} line={line} />
            ))}
          </ul>
        </section>
        <section>
          <h2>Steps</h2>
          <ol className="steps">
            {recipe.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>
      </div>
    </article>
  );
}
