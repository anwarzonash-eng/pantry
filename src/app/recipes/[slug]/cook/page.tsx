import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { sectionHeading } from "@/lib/ingredients/parse";
import { getRecipeBySlug } from "@/lib/recipes";
import { CookMode } from "./CookMode";

export const dynamic = "force-dynamic";

export default async function CookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(getDb(), slug);
  if (!recipe) notFound();
  return (
    <CookMode
      title={recipe.title}
      slug={recipe.slug}
      steps={recipe.steps.filter((s) => !sectionHeading(s))}
      ingredients={recipe.ingredients}
    />
  );
}
