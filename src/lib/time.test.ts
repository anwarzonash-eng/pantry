import { describe, expect, it } from "vitest";
import { formatMinutes, totalMinutes } from "./time";

describe("time", () => {
  it("formats minutes", () => {
    expect(formatMinutes(45)).toBe("45 min");
    expect(formatMinutes(90)).toBe("1 h 30 min");
    expect(formatMinutes(120)).toBe("2 h");
  });
  it("totals prep and cook", () => {
    expect(totalMinutes({ prepMinutes: 10, cookMinutes: 25 })).toBe(35);
    expect(totalMinutes({ prepMinutes: null, cookMinutes: 25 })).toBe(25);
    expect(totalMinutes({ prepMinutes: null, cookMinutes: null })).toBeNull();
  });
});
