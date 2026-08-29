"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { parseSystem, UNIT_COOKIE } from "@/lib/ingredients/units";
import { getDb } from "@/lib/db";
import { addToPantry, pantryMatcher } from "@/lib/pantry";
import { isISODate } from "@/lib/dates";
import { shoppingForWeek } from "@/lib/shopping/fromPlan";
import { parseIngredient } from "@/lib/ingredients/parse";
import { addManualItem, checkedNames, removeItem, saveGenerated, setChecked } from "@/lib/shopping/list";

export async function generateList(week: string) {
  if (!isISODate(week)) return;
  const db = getDb();
  const system = parseSystem((await cookies()).get(UNIT_COOKIE)?.value) ?? "metric";
  saveGenerated(db, week, shoppingForWeek(db, week, system), pantryMatcher(db));
  revalidatePath("/shopping");
}

export async function toggleItem(id: number, checked: boolean) {
  setChecked(getDb(), id, checked);
  revalidatePath("/shopping");
}

export async function addItem(week: string, form: FormData) {
  const text = String(form.get("item") ?? "").trim();
  if (!isISODate(week) || !text) return;
  // "2 lemons" or "1 kg rice" gets an amount, anything else is just a name
  const ing = parseIngredient(text);
  addManualItem(getDb(), week, ing.name || text, ing.quantity, ing.unit);
  revalidatePath("/shopping");
}

export async function deleteItem(id: number) {
  removeItem(getDb(), id);
  revalidatePath("/shopping");
}

/** Everything ticked off goes into the pantry, so next week's list knows you have it. */
export async function putAway(week: string) {
  if (!isISODate(week)) return;
  const db = getDb();
  addToPantry(db, checkedNames(db, week).join("\n"));
  revalidatePath("/shopping");
  revalidatePath("/pantry");
}
