import type { RecipeInput } from "./recipes";

// Most recipe sites describe the recipe for search engines with schema.org
// JSON-LD. Reading that is far more reliable than scraping the page.

type Json = unknown;

const asArray = (v: Json): Json[] => (Array.isArray(v) ? v : v == null ? [] : [v]);
const text = (v: Json): string => (typeof v === "string" ? decode(v).replace(/<[^>]+>/g, "").trim() : "");

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function isRecipe(node: Json): node is Record<string, Json> {
  if (!node || typeof node !== "object") return false;
  const type = (node as Record<string, Json>)["@type"];
  return asArray(type).some((t) => t === "Recipe");
}

/** ISO 8601 durations like "PT1H30M" -> 90 */
export function parseDuration(value: Json): number | null {
  if (typeof value !== "string") return null;
  const m = value.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/i);
  if (!m) return null;
  const minutes = Number(m[1] ?? 0) * 1440 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
  return minutes || null;
}

function steps(value: Json): string[] {
  if (typeof value === "string") return value.split(/\n+/).map((s) => text(s)).filter(Boolean);
  return asArray(value)
    .flatMap((s): string[] => {
      if (typeof s === "string") return [text(s)];
      const node = s as Record<string, Json>;
      // HowToSection groups steps: { "@type": "HowToSection", name, itemListElement: [...] }
      if (node?.itemListElement) return steps(node.itemListElement);
      return [text(node?.text ?? node?.name)];
    })
    .filter(Boolean);
}

/** All nodes in the data, including those inside "@graph" (Yoast and similar). */
function nodes(data: Json): Json[] {
  return asArray(data).flatMap((n) => {
    const graph = (n as Record<string, Json>)?.["@graph"];
    return graph ? [n, ...nodes(graph)] : [n];
  });
}

function recipeFrom(node: Record<string, Json>, url?: string): RecipeInput {
  const yieldText = asArray(node.recipeYield).map(String).join(" ");
  const keywords = typeof node.keywords === "string" ? node.keywords.split(",") : asArray(node.keywords).map(String);
  return {
    title: text(node.name),
    description: text(node.description),
    servings: Number.parseInt(yieldText, 10) || undefined,
    ingredients: asArray(node.recipeIngredient).map(text).filter(Boolean),
    steps: steps(node.recipeInstructions),
    tags: [...asArray(node.recipeCategory).map(String), ...keywords].map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 5),
    prepMinutes: parseDuration(node.prepTime),
    cookMinutes: parseDuration(node.cookTime),
    sourceUrl: url,
  };
}

/** Find a schema.org Recipe in a page's HTML. Returns null when there is none. */
export function recipeFromHtml(html: string, url?: string): RecipeInput | null {
  const blocks = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const [, body] of blocks) {
    let data: Json;
    try {
      data = JSON.parse(body.trim());
    } catch {
      continue;
    }
    for (const node of nodes(data)) {
      if (isRecipe(node)) {
        const recipe = recipeFrom(node, url);
        if (recipe.title) return recipe;
      }
    }
  }
  return null;
}
