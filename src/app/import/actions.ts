"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { fromMarkdown } from "@/lib/markdown";
import { createRecipe } from "@/lib/recipes";

export type ImportState = { error?: string };

export async function importMarkdown(_prev: ImportState, form: FormData): Promise<ImportState> {
  const recipe = fromMarkdown(String(form.get("markdown") ?? ""));
  if (!recipe) return { error: "Could not find a title. The recipe should start with a line like “# Tomato Soup”." };
  const saved = createRecipe(getDb(), recipe);
  redirect(`/recipes/${saved.slug}`);
}
