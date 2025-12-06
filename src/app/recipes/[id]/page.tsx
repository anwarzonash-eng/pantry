import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { getRecipe } from "@/lib/recipes";
import { IngredientLine } from "@/components/IngredientLine";

export const dynamic = "force-dynamic";

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = getRecipe(getDb(), Number(id));
  if (!recipe) notFound();

  return (
    <article className="recipe">
      <div className="page-head">
        <h1>{recipe.title}</h1>
        <Link href={`/recipes/${recipe.id}/edit`}>Edit</Link>
      </div>
      {recipe.description && <p className="lead">{recipe.description}</p>}
      <p className="muted">Serves {recipe.servings}</p>

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
