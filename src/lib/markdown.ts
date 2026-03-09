import type { RecipeInput } from "./recipes";

type Exportable = Pick<RecipeInput, "title" | "description" | "servings" | "ingredients" | "steps" | "tags">;

/** A plain Markdown version of a recipe that reads well and imports back. */
export function toMarkdown(r: Exportable): string {
  const out = [`# ${r.title}`, ""];
  if (r.description) out.push(r.description, "");
  out.push(`Serves: ${r.servings ?? 2}`);
  if (r.tags?.length) out.push(`Tags: ${r.tags.join(", ")}`);
  out.push("", "## Ingredients", "", ...r.ingredients.map((i) => `- ${i}`), "");
  out.push("## Steps", "", ...r.steps.map((s, i) => `${i + 1}. ${s}`), "");
  return out.join("\n");
}
