import { describe, expect, it } from "vitest";
import { addDays, isISODate, startOfWeek, toISODate, weekDays } from "./dates";

describe("dates", () => {
  it("formats local dates", () => {
    expect(toISODate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("adds days across months and years", () => {
    expect(addDays("2026-01-30", 3)).toBe("2026-02-02");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
  });

  it("week starts on Monday", () => {
    expect(startOfWeek("2026-01-07")).toBe("2026-01-05"); // Wednesday
    expect(startOfWeek("2026-01-05")).toBe("2026-01-05");
    expect(startOfWeek("2026-01-11")).toBe("2026-01-05"); // Sunday
    expect(weekDays("2026-01-05")).toHaveLength(7);
    expect(weekDays("2026-01-05")[6]).toBe("2026-01-11");
  });

  it("validates", () => {
    expect(isISODate("2026-02-30")).toBe(false);
    expect(isISODate("hello")).toBe(false);
    expect(isISODate("2026-02-28")).toBe(true);
  });
});
