import { notFound } from "next/navigation";
import { RecipeForm } from "@/components/RecipeForm";
import { getDb } from "@/lib/db";
import { getRecipeBySlug } from "@/lib/recipes";
import { removeRecipe, saveRecipe } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditRecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(getDb(), slug);
  if (!recipe) notFound();
  return (
    <section>
      <h1>Edit {recipe.title}</h1>
      <RecipeForm action={saveRecipe.bind(null, recipe.id)} recipe={recipe} />
      <form action={removeRecipe.bind(null, recipe.id)} className="danger-zone">
        <button type="submit" className="button danger">
          Delete recipe
        </button>
      </form>
    </section>
  );
}
