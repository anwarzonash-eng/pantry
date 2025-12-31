import type { Ingredient } from "./parse";

/** Multiply the amounts; lines without an amount ("salt to taste") stay as they are. */
export function scaleIngredient(ing: Ingredient, factor: number): Ingredient {
  if (ing.quantity === null || factor === 1) return ing;
  return {
    ...ing,
    quantity: ing.quantity * factor,
    quantityMax: ing.quantityMax === null ? null : ing.quantityMax * factor,
  };
}
