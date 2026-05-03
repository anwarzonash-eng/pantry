"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { createRecipe, deleteRecipe, parseTags, setFavorite, updateRecipe, type RecipeInput } from "@/lib/recipes";

const lines = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

function readForm(form: FormData): RecipeInput {
  const title = String(form.get("title") ?? "").trim();
  if (!title) throw new Error("A recipe needs a title");
  return {
    title,
    description: String(form.get("description") ?? ""),
    servings: Number(form.get("servings")) || 2,
    ingredients: lines(form.get("ingredients")),
    steps: lines(form.get("steps")),
    tags: parseTags(String(form.get("tags") ?? "")),
    notes: String(form.get("notes") ?? ""),
    sourceUrl: String(form.get("sourceUrl") ?? ""),
    prepMinutes: Number(form.get("prepMinutes")) || null,
    cookMinutes: Number(form.get("cookMinutes")) || null,
  };
}

export async function saveNewRecipe(form: FormData) {
  const recipe = createRecipe(getDb(), readForm(form));
  redirect(`/recipes/${recipe.slug}`);
}

export async function saveRecipe(id: number, form: FormData) {
  const recipe = updateRecipe(getDb(), id, readForm(form));
  redirect(recipe ? `/recipes/${recipe.slug}` : "/");
}

export async function removeRecipe(id: number) {
  deleteRecipe(getDb(), id);
  redirect("/");
}

export async function toggleFavorite(id: number, favorite: boolean) {
  setFavorite(getDb(), id, favorite);
  revalidatePath("/", "layout");
}
