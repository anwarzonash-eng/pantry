import { describe, expect, it } from "vitest";
import type { ShoppingItem } from "./list";
import { listAsText } from "./text";

const item = (name: string, quantity: number | null, unit: string | null, extra: Partial<ShoppingItem> = {}): ShoppingItem => ({
  id: 1, name, quantity, unit, recipes: [], checked: false, manual: false, inPantry: false, ...extra,
});

describe("listAsText", () => {
  it("groups by aisle and skips ticked and pantry items", () => {
    const text = listAsText([
      item("milk", 1, "l"),
      item("onion", 2, null),
      item("garlic", null, null),
      item("rice", 500, "g", { checked: true }),
      item("salt", null, null, { inPantry: true }),
    ]);
    expect(text).toBe("Fruit & veg\n- 2 onion\n- garlic\n\nDairy & eggs\n- 1 l milk");
  });
});
