import { parseTags, type RecipeInput } from "./recipes";

export class FormError extends Error {}

const lines = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

const positive = (value: FormDataEntryValue | null) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
};

/** The recipe form, read and checked in one place (shared by "new" and "edit"). */
export function recipeFromForm(form: FormData): RecipeInput {
  const title = String(form.get("title") ?? "").trim();
  if (!title) throw new FormError("A recipe needs a title");
  if (title.length > 200) throw new FormError("That title is too long");
  return {
    title,
    description: String(form.get("description") ?? ""),
    servings: Math.min(positive(form.get("servings")) ?? 2, 100),
    ingredients: lines(form.get("ingredients")),
    steps: lines(form.get("steps")),
    tags: parseTags(String(form.get("tags") ?? "")),
    notes: String(form.get("notes") ?? ""),
    sourceUrl: String(form.get("sourceUrl") ?? ""),
    imageUrl: String(form.get("imageUrl") ?? ""),
    prepMinutes: positive(form.get("prepMinutes")),
    cookMinutes: positive(form.get("cookMinutes")),
  };
}
