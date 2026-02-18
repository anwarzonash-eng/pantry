import { describe, expect, it } from "vitest";
import { bestUnit, convert, dimension, normalizeUnit, toBase } from "./units";

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

describe("conversion", () => {
  it("knows the dimension", () => {
    expect(dimension("cup")).toBe("volume");
    expect(dimension("lb")).toBe("mass");
    expect(dimension("clove")).toBeNull();
  });

  it("converts within a dimension", () => {
    expect(convert(1, "kg", "g")).toBe(1000);
    expect(convert(3, "tsp", "tbsp")).toBeCloseTo(1, 2);
    expect(convert(1, "lb", "oz")).toBeCloseTo(16, 1);
    expect(convert(1, "cup", "g")).toBeNull();
    expect(toBase(2, "clove")).toBeNull();
  });

  it("chooses readable units", () => {
    expect(bestUnit(1500, "mass")).toEqual({ quantity: 1.5, unit: "kg" });
    expect(bestUnit(250, "volume")).toEqual({ quantity: 250, unit: "ml" });
    expect(bestUnit(10, "volume", "imperial").unit).toBe("tsp");
    expect(bestUnit(30, "volume", "imperial").unit).toBe("tbsp");
    expect(bestUnit(480, "volume", "imperial").quantity).toBeCloseTo(2, 1);
    expect(bestUnit(900, "mass", "imperial").unit).toBe("lb");
  });
});
