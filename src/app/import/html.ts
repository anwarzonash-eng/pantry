"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { recipeFromHtml } from "@/lib/jsonld";
import { createRecipe } from "@/lib/recipes";

export type HtmlImportState = { error?: string };

export async function importHtml(_prev: HtmlImportState, form: FormData): Promise<HtmlImportState> {
  const recipe = recipeFromHtml(String(form.get("html") ?? ""));
  if (!recipe) return { error: "No recipe data found in that page source." };
  const saved = createRecipe(getDb(), recipe);
  redirect(`/recipes/${saved.slug}`);
}
