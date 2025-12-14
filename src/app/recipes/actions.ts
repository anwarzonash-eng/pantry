"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { createRecipe, deleteRecipe, updateRecipe, type RecipeInput } from "@/lib/recipes";

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
