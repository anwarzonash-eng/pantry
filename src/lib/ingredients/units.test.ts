import { describe, expect, it } from "vitest";
import { normalizeUnit } from "./units";

describe("normalizeUnit", () => {
  it("maps spellings", () => {
    expect(normalizeUnit("Tablespoons")).toBe("tbsp");
    expect(normalizeUnit("tbsp.")).toBe("tbsp");
    expect(normalizeUnit("grammes")).toBe("g");
    expect(normalizeUnit("tins")).toBe("can");
  });
  it("returns null for words that are not units", () => {
    expect(normalizeUnit("carrots")).toBeNull();
  });
});
