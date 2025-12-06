import type { Recipe } from "@/lib/recipes";

type Props = {
  action: (form: FormData) => Promise<void>;
  recipe?: Recipe;
};

export function RecipeForm({ action, recipe }: Props) {
  return (
    <form action={action} className="recipe-form">
      <label>
        Title
        <input name="title" required defaultValue={recipe?.title} />
      </label>
      <label>
        Description
        <input name="description" defaultValue={recipe?.description} />
      </label>
      <label>
        Servings
        <input name="servings" type="number" min={1} defaultValue={recipe?.servings ?? 2} />
      </label>
      <label>
        Ingredients <span className="muted">(one per line)</span>
        <textarea
          name="ingredients"
          rows={10}
          defaultValue={recipe?.ingredients.join("\n")}
          placeholder={"200 g spaghetti\n2 cloves garlic\n1 tbsp olive oil"}
        />
      </label>
      <label>
        Steps <span className="muted">(one per line)</span>
        <textarea name="steps" rows={10} defaultValue={recipe?.steps.join("\n")} />
      </label>
      <button className="button" type="submit">
        Save
      </button>
    </form>
  );
}
