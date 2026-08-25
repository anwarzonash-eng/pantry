"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { recipeFromForm } from "@/lib/forms";
import { createRecipe, deleteRecipe, duplicateRecipe, setFavorite, updateRecipe } from "@/lib/recipes";

export async function saveNewRecipe(form: FormData) {
  const recipe = createRecipe(getDb(), recipeFromForm(form));
  redirect(`/recipes/${recipe.slug}`);
}

export async function saveRecipe(id: number, form: FormData) {
  const recipe = updateRecipe(getDb(), id, recipeFromForm(form));
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

export async function copyRecipe(id: number) {
  const copy = duplicateRecipe(getDb(), id);
  redirect(copy ? `/recipes/${copy.slug}/edit` : "/");
}
