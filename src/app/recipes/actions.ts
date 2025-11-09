"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { createRecipe } from "@/lib/recipes";

const lines = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

export async function saveNewRecipe(form: FormData) {
  const title = String(form.get("title") ?? "").trim();
  if (!title) throw new Error("A recipe needs a title");
  const recipe = createRecipe(getDb(), {
    title,
    description: String(form.get("description") ?? ""),
    servings: Number(form.get("servings")) || 2,
    ingredients: lines(form.get("ingredients")),
    steps: lines(form.get("steps")),
  });
  redirect(`/recipes/${recipe.id}`);
}
