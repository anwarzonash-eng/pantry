import { describe, expect, it } from "vitest";
import { normalizeName } from "./names";

describe("normalizeName", () => {
  it("makes the last word singular", () => {
    expect(normalizeName("Tomatoes")).toBe("tomato");
    expect(normalizeName("cherry  tomatoes")).toBe("cherry tomato");
    expect(normalizeName("blueberries")).toBe("blueberry");
    expect(normalizeName("bay leaves")).toBe("bay leaf");
    expect(normalizeName("peaches")).toBe("peach");
    expect(normalizeName("eggs")).toBe("egg");
    expect(normalizeName("chickpeas")).toBe("chickpea");
  });

  it("leaves words that only look plural", () => {
    expect(normalizeName("hummus")).toBe("hummus");
    expect(normalizeName("couscous")).toBe("couscous");
    expect(normalizeName("glass")).toBe("glass");
    expect(normalizeName("oats")).toBe("oat");
  });
});
