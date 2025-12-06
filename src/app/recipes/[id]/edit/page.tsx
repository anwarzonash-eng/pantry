import { notFound } from "next/navigation";
import { RecipeForm } from "@/components/RecipeForm";
import { getDb } from "@/lib/db";
import { getRecipe } from "@/lib/recipes";
import { saveRecipe } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = getRecipe(getDb(), Number(id));
  if (!recipe) notFound();
  return (
    <section>
      <h1>Edit {recipe.title}</h1>
      <RecipeForm action={saveRecipe.bind(null, recipe.id)} recipe={recipe} />
    </section>
  );
}
