import { saveNewRecipe } from "../actions";

export default function NewRecipePage() {
  return (
    <section>
      <h1>New recipe</h1>
      <form action={saveNewRecipe} className="recipe-form">
        <label>
          Title
          <input name="title" required />
        </label>
        <label>
          Description
          <input name="description" />
        </label>
        <label>
          Servings
          <input name="servings" type="number" min={1} defaultValue={2} />
        </label>
        <label>
          Ingredients <span className="muted">(one per line)</span>
          <textarea name="ingredients" rows={8} placeholder={"200 g spaghetti\n2 cloves garlic\n1 tbsp olive oil"} />
        </label>
        <label>
          Steps <span className="muted">(one per line)</span>
          <textarea name="steps" rows={8} />
        </label>
        <button className="button" type="submit">Save</button>
      </form>
    </section>
  );
}
