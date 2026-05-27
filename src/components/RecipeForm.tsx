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
        Tags <span className="muted">(comma separated)</span>
        <input name="tags" defaultValue={recipe?.tags.join(", ")} placeholder="dinner, quick, vegetarian" />
      </label>
      <div className="form-row">
        <label>
          Servings
          <input name="servings" type="number" min={1} defaultValue={recipe?.servings ?? 2} />
        </label>
        <label>
          Prep (min)
          <input name="prepMinutes" type="number" min={0} defaultValue={recipe?.prepMinutes ?? ""} />
        </label>
        <label>
          Cook (min)
          <input name="cookMinutes" type="number" min={0} defaultValue={recipe?.cookMinutes ?? ""} />
        </label>
      </div>
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
      <label>
        Notes <span className="muted">(substitutions, what to change next time)</span>
        <textarea name="notes" rows={3} defaultValue={recipe?.notes} />
      </label>
      <label>
        Photo <span className="muted">(link to an image)</span>
        <input name="imageUrl" type="url" defaultValue={recipe?.imageUrl} placeholder="https://" />
      </label>
      <label>
        Source <span className="muted">(link to where the recipe came from)</span>
        <input name="sourceUrl" type="url" defaultValue={recipe?.sourceUrl} placeholder="https://" />
      </label>
      <button className="button" type="submit">
        Save
      </button>
    </form>
  );
}
