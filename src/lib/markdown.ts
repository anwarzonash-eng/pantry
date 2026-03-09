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

/**
 * Read a recipe written in Markdown: "# Title", an optional description,
 * "Serves: 4" / "Tags: a, b", then "## Ingredients" and "## Steps" (or
 * "Method", "Directions") lists. Returns null without a title.
 */
export function fromMarkdown(text: string): RecipeInput | null {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  let title = "";
  let section: "intro" | "ingredients" | "steps" | "other" = "intro";
  const intro: string[] = [];
  const ingredients: string[] = [];
  const steps: string[] = [];
  let servings: number | undefined;
  let tags: string[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const name = heading[2].toLowerCase();
      if (heading[1].length === 1 && !title) title = heading[2].trim();
      else if (/ingredient/.test(name)) section = "ingredients";
      else if (/step|method|direction|instruction|preparation/.test(name)) section = "steps";
      else section = "other";
      continue;
    }
    if (!line) continue;

    const meta = line.match(/^(serves|servings|yield|tags)\s*:?\s*(.+)$/i);
    if (section === "intro" && meta) {
      if (meta[1].toLowerCase() === "tags") tags = meta[2].split(",").map((t) => t.trim()).filter(Boolean);
      else servings = Number.parseInt(meta[2], 10) || undefined;
      continue;
    }

    const item = line.replace(/^([-*+]|\d+[.)])\s+/, "");
    if (section === "ingredients") ingredients.push(item);
    else if (section === "steps") steps.push(item);
    else if (section === "intro") intro.push(line);
  }

  if (!title) return null;
  return { title, description: intro.join(" "), servings, ingredients, steps, tags };
}
