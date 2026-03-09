import { describe, expect, it } from "vitest";
import { fromMarkdown, toMarkdown } from "./markdown";

const recipe = {
  title: "Red Lentil Soup",
  description: "Warming and cheap.",
  servings: 4,
  tags: ["lunch", "vegetarian"],
  ingredients: ["1 cup red lentils", "1 onion, diced"],
  steps: ["Soften the onion.", "Add lentils and simmer."],
};

describe("markdown", () => {
  it("round trips", () => {
    expect(fromMarkdown(toMarkdown(recipe))).toEqual(recipe);
  });

  it("reads hand-written variations", () => {
    const md = `# Pancakes

Fluffy ones.

Servings 2

### Ingredients
* 1 cup flour
+ 1 egg

### Method
1) Mix.
2) Fry.

## Notes
Use a hot pan.`;
    expect(fromMarkdown(md)).toEqual({
      title: "Pancakes",
      description: "Fluffy ones.",
      servings: 2,
      tags: [],
      ingredients: ["1 cup flour", "1 egg"],
      steps: ["Mix.", "Fry."],
    });
  });

  it("needs a title", () => {
    expect(fromMarkdown("## Ingredients\n- salt")).toBeNull();
  });
});
