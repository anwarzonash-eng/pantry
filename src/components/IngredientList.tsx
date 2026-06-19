"use client";

import { useState } from "react";
import { parseIngredient, sectionHeading } from "@/lib/ingredients/parse";
import { formatAmount } from "@/lib/ingredients/format";
import { scaleIngredient } from "@/lib/ingredients/scale";
import { inSystem, type UnitSystem } from "@/lib/ingredients/units";

/** Ingredient list with a servings control that scales the amounts. */
type Props = { lines: string[]; servings: number; system: UnitSystem | null };

export function IngredientList({ lines, servings, system }: Props) {
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
          const heading = sectionHeading(line);
          if (heading) {
            return (
              <li key={i} className="section">
                {heading}
              </li>
            );
          }
          let ing = scaleIngredient(parseIngredient(line), factor);
          if (ing.quantity === null) return <li key={i}>{line}</li>;
          if (system) {
            const shown = inSystem(ing.quantity, ing.unit, system);
            if (shown.unit !== ing.unit) {
              const ratio = shown.quantity / ing.quantity;
              ing = { ...ing, ...shown, quantityMax: ing.quantityMax === null ? null : ing.quantityMax * ratio };
            }
          }
          return (
            <li key={i}>
              <strong>{formatAmount(ing)}</strong>{" "}
              {ing.name}
              {ing.note && <span className="muted">, {ing.note}</span>}
            </li>
          );
        })}
      </ul>
    </>
  );
}
