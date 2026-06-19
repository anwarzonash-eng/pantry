import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { parseSystem, UNIT_COOKIE } from "@/lib/ingredients/units";
import { getDb } from "@/lib/db";
import { getRecipeBySlug } from "@/lib/recipes";
import { IngredientList } from "@/components/IngredientList";
import { PrintButton } from "@/components/PrintButton";
import { sectionHeading } from "@/lib/ingredients/parse";
import { formatMinutes, totalMinutes } from "@/lib/time";
import { copyRecipe, toggleFavorite } from "../actions";

export const dynamic = "force-dynamic";

export default async function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(getDb(), slug);
  if (!recipe) notFound();
  const total = totalMinutes(recipe);
  const system = parseSystem((await cookies()).get(UNIT_COOKIE)?.value);

  return (
    <article className="recipe">
      <div className="page-head">
        <h1>
          <form action={toggleFavorite.bind(null, recipe.id, !recipe.favorite)} className="fav-form">
            <button
              type="submit"
              className={`fav ${recipe.favorite ? "on" : ""}`}
              aria-pressed={recipe.favorite}
              aria-label={recipe.favorite ? "Remove from favourites" : "Add to favourites"}
            >
              {recipe.favorite ? "★" : "☆"}
            </button>
          </form>
          {recipe.title}
        </h1>
        <span className="actions">
          <Link href={`/recipes/${recipe.slug}/cook`}>Cook</Link>
          <PrintButton />
          <a href={`/recipes/${recipe.slug}/markdown`}>Markdown</a>
          <form action={copyRecipe.bind(null, recipe.id)}>
            <button type="submit" className="link-button">
              Duplicate
            </button>
          </form>
          <Link href={`/recipes/${recipe.slug}/edit`}>Edit</Link>
        </span>
      </div>
      {recipe.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- images come from anywhere, no optimisation
        <img src={recipe.imageUrl} alt="" className="hero" />
      )}
      {recipe.description && <p className="lead">{recipe.description}</p>}
      <p className="muted meta">
        <span>Serves {recipe.servings}</span>
        {recipe.prepMinutes && <span>Prep {formatMinutes(recipe.prepMinutes)}</span>}
        {recipe.cookMinutes && <span>Cook {formatMinutes(recipe.cookMinutes)}</span>}
        {total && recipe.prepMinutes && recipe.cookMinutes && <span>Total {formatMinutes(total)}</span>}
      </p>
      {recipe.tags.length > 0 && (
        <p className="tags">
          {recipe.tags.map((t) => (
            <Link key={t} href={`/?tag=${encodeURIComponent(t)}`} className="tag">
              {t}
            </Link>
          ))}
        </p>
      )}

      <div className="recipe-body">
        <section>
          <h2>Ingredients</h2>
          <IngredientList lines={recipe.ingredients} servings={recipe.servings} system={system} />
        </section>
        <section>
          <h2>Steps</h2>
          <ol className="steps">
            {recipe.steps.map((step, i) =>
              sectionHeading(step) ? (
                <li key={i} className="section">
                  {sectionHeading(step)}
                </li>
              ) : (
                <li key={i}>{step}</li>
              ),
            )}
          </ol>
          {recipe.notes && (
            <>
              <h2>Notes</h2>
              <p className="notes">{recipe.notes}</p>
            </>
          )}
          {recipe.sourceUrl && (
            <p className="muted source">
              From <a href={recipe.sourceUrl}>{new URL(recipe.sourceUrl).hostname.replace(/^www\./, "")}</a>
            </p>
          )}
        </section>
      </div>
    </article>
  );
}
