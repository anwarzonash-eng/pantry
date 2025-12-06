import { RecipeForm } from "@/components/RecipeForm";
import { saveNewRecipe } from "../actions";

export default function NewRecipePage() {
  return (
    <section>
      <h1>New recipe</h1>
      <RecipeForm action={saveNewRecipe} />
    </section>
  );
}
