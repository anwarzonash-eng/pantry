import { formatQuantity } from "../ingredients/format";
import { groupByAisle } from "./aisles";
import type { ShoppingItem } from "./list";

/** The list as plain text for a message or a notes app; ticked items left out. */
export function listAsText(items: ShoppingItem[]): string {
  const open = items.filter((i) => !i.checked && !i.inPantry);
  return groupByAisle(open)
    .map(({ aisle, items }) => {
      const lines = items.map((i) => {
        const amount = [i.quantity !== null ? formatQuantity(i.quantity) : "", i.unit ?? ""].filter(Boolean).join(" ");
        return `- ${amount ? `${amount} ` : ""}${i.name}`;
      });
      return `${aisle}\n${lines.join("\n")}`;
    })
    .join("\n\n");
}
