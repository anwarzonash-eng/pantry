"use client";

import { useState } from "react";
import { parseIngredient } from "@/lib/ingredients/parse";
import { scaleIngredient } from "@/lib/ingredients/scale";

const round = (n: number) => String(Math.round(n * 100) / 100);

/** Ingredient list with a servings control that scales the amounts. */
export function IngredientList({ lines, servings }: { lines: string[]; servings: number }) {
  const [people, setPeople] = useState(servings);
  const factor = people / servings;

  return (
    <>
      <div className="scaler">
        <button type="button" onClick={() => setPeople((p) => Math.max(1, p - 1))} aria-label="Fewer servings">
          −
        </button>
        <span>
          {people} {people === 1 ? "serving" : "servings"}
        </span>
        <button type="button" onClick={() => setPeople((p) => p + 1)} aria-label="More servings">
          +
        </button>
      </div>
      <ul className="ingredients">
        {lines.map((line, i) => {
          const ing = scaleIngredient(parseIngredient(line), factor);
          if (ing.quantity === null) return <li key={i}>{line}</li>;
          const amount = ing.quantityMax ? `${round(ing.quantity)}-${round(ing.quantityMax)}` : round(ing.quantity);
          return (
            <li key={i}>
              <strong>
                {amount}
                {ing.unit ? ` ${ing.unit}` : ""}
              </strong>{" "}
              {ing.name}
              {ing.note && <span className="muted">, {ing.note}</span>}
            </li>
          );
        })}
      </ul>
    </>
  );
}
