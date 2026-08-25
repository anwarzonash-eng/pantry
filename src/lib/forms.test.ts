import { describe, expect, it } from "vitest";
import { FormError, recipeFromForm } from "./forms";

const form = (fields: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
};

describe("recipeFromForm", () => {
  it("reads and cleans the fields", () => {
    const r = recipeFromForm(
      form({
        title: "  Dal ",
        servings: "4",
        ingredients: "1 cup lentils\n\n  1 onion  \n",
        steps: "Cook.\r\nServe.",
        tags: "dinner, Dinner, quick",
        prepMinutes: "10",
        cookMinutes: "-5",
      }),
    );
    expect(r).toMatchObject({
      title: "Dal",
      servings: 4,
      ingredients: ["1 cup lentils", "1 onion"],
      steps: ["Cook.", "Serve."],
      tags: ["dinner", "quick"],
      prepMinutes: 10,
      cookMinutes: null,
    });
  });

  it("defaults and limits", () => {
    expect(recipeFromForm(form({ title: "X" })).servings).toBe(2);
    expect(recipeFromForm(form({ title: "X", servings: "5000" })).servings).toBe(100);
    expect(() => recipeFromForm(form({ title: "  " }))).toThrow(FormError);
    expect(() => recipeFromForm(form({ title: "x".repeat(201) }))).toThrow(/too long/);
  });
});
