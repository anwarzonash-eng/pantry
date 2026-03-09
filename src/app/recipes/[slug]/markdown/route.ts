import { getDb } from "@/lib/db";
import { toMarkdown } from "@/lib/markdown";
import { getRecipeBySlug } from "@/lib/recipes";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(getDb(), slug);
  if (!recipe) return new Response("Not found", { status: 404 });
  return new Response(toMarkdown(recipe), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="${recipe.slug}.md"`,
    },
  });
}
