"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { FetchError, fetchPage } from "@/lib/fetchPage";
import { recipeFromHtml } from "@/lib/jsonld";
import { createRecipe } from "@/lib/recipes";

export type HtmlImportState = { error?: string };

export async function importHtml(_prev: HtmlImportState, form: FormData): Promise<HtmlImportState> {
  const link = String(form.get("url") ?? "").trim();
  let html = String(form.get("html") ?? "");
  if (link) {
    try {
      html = await fetchPage(link);
    } catch (err) {
      if (err instanceof FetchError) return { error: err.message };
      throw err;
    }
  }
  const recipe = recipeFromHtml(html, link || undefined);
  if (!recipe) {
    return { error: link ? "That page has no recipe data pantry can read. Try pasting the page source." : "No recipe data found in that page source." };
  }
  const saved = createRecipe(getDb(), recipe);
  redirect(`/recipes/${saved.slug}`);
}
