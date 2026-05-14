import type Database from "better-sqlite3";
import { addDays } from "../dates";
import { parseIngredient, sectionHeading } from "../ingredients/parse";
import { mealsBetween } from "../plan";
import { getRecipe } from "../recipes";
import { buildShoppingList, type Needed, type ShoppingLine } from "./build";

/** Shopping list for the seven days starting at `monday`. */
export function shoppingForWeek(db: Database.Database, monday: string): ShoppingLine[] {
  const needed: Needed[] = [];
  for (const meal of mealsBetween(db, monday, addDays(monday, 6))) {
    const recipe = getRecipe(db, meal.recipeId);
    if (!recipe) continue;
    const factor = meal.servings ? meal.servings / recipe.servings : 1;
    for (const line of recipe.ingredients) {
      if (sectionHeading(line)) continue;
      needed.push({ recipe: recipe.title, ingredient: parseIngredient(line), factor });
    }
  }
  return buildShoppingList(needed);
}
