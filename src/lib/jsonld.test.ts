import { describe, expect, it } from "vitest";
import { parseDuration, recipeFromHtml } from "./jsonld";

const page = (json: unknown) =>
  `<html><head><script type="application/ld+json">${JSON.stringify(json)}</script></head><body>…</body></html>`;

describe("recipeFromHtml", () => {
  it("reads a schema.org Recipe", () => {
    const html = page({
      "@context": "https://schema.org",
      "@type": "Recipe",
      name: "Simple Flatbreads",
      description: "Soft &amp; quick.",
      recipeYield: "4 servings",
      prepTime: "PT10M",
      cookTime: "PT1H5M",
      recipeCategory: "Bread",
      keywords: "quick, vegan",
      recipeIngredient: ["250 g flour", "150 ml warm water", "1 tsp salt"],
      recipeInstructions: [
        { "@type": "HowToStep", text: "Mix everything into a dough." },
        { "@type": "HowToStep", text: "Cook in a dry pan." },
      ],
    });
    expect(recipeFromHtml(html, "https://example.com/flatbreads")).toEqual({
      title: "Simple Flatbreads",
      description: "Soft & quick.",
      servings: 4,
      ingredients: ["250 g flour", "150 ml warm water", "1 tsp salt"],
      steps: ["Mix everything into a dough.", "Cook in a dry pan."],
      tags: ["bread", "quick", "vegan"],
      prepMinutes: 10,
      cookMinutes: 65,
      sourceUrl: "https://example.com/flatbreads",
    });
  });

  it("instructions as one string, type as a list", () => {
    const r = recipeFromHtml(page({ "@type": ["Recipe", "Thing"], name: "X", recipeInstructions: "Do this.\nThen that." }));
    expect(r?.steps).toEqual(["Do this.", "Then that."]);
  });

  it("no recipe on the page", () => {
    expect(recipeFromHtml("<p>hello</p>")).toBeNull();
    expect(recipeFromHtml(page({ "@type": "Article", name: "News" }))).toBeNull();
    expect(recipeFromHtml('<script type="application/ld+json">{broken</script>')).toBeNull();
  });
});

describe("parseDuration", () => {
  it("ISO 8601", () => {
    expect(parseDuration("PT45M")).toBe(45);
    expect(parseDuration("PT2H")).toBe(120);
    expect(parseDuration("P1DT2H")).toBe(1560);
    expect(parseDuration("soon")).toBeNull();
  });
});

describe("real-world shapes", () => {
  it("recipe inside @graph", () => {
    const html = page({
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebSite", name: "A food blog" },
        { "@type": "Recipe", name: "Blog Brownies", recipeIngredient: ["200 g chocolate"] },
      ],
    });
    expect(recipeFromHtml(html)?.title).toBe("Blog Brownies");
  });

  it("steps grouped in HowToSection", () => {
    const html = page({
      "@type": "Recipe",
      name: "Layer Cake",
      recipeInstructions: [
        { "@type": "HowToSection", name: "Sponge", itemListElement: [{ "@type": "HowToStep", text: "Bake the sponges." }] },
        { "@type": "HowToSection", name: "Icing", itemListElement: [{ "@type": "HowToStep", text: "Whip the cream." }] },
      ],
    });
    expect(recipeFromHtml(html)?.steps).toEqual(["Bake the sponges.", "Whip the cream."]);
  });
});
