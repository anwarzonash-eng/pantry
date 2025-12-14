import { describe, expect, it } from "vitest";
import { slugify, uniqueSlug } from "./slug";

describe("slugify", () => {
  it("lowercases and dashes", () => {
    expect(slugify("Weeknight Tomato Pasta")).toBe("weeknight-tomato-pasta");
    expect(slugify("  Mac & Cheese!! ")).toBe("mac-cheese");
  });
  it("drops accents", () => {
    expect(slugify("Crème Brûlée")).toBe("creme-brulee");
  });
  it("never empty", () => {
    expect(slugify("!!!")).toBe("recipe");
  });
});

describe("uniqueSlug", () => {
  it("adds a number when taken", () => {
    const taken = new Set(["soup", "soup-2"]);
    expect(uniqueSlug((s) => taken.has(s), "Soup")).toBe("soup-3");
    expect(uniqueSlug(() => false, "Soup")).toBe("soup");
  });
});
