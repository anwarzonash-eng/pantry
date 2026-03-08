"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { pantryMatcher } from "@/lib/pantry";
import { isISODate } from "@/lib/dates";
import { shoppingForWeek } from "@/lib/shopping/fromPlan";
import { parseIngredient } from "@/lib/ingredients/parse";
import { addManualItem, removeItem, saveGenerated, setChecked } from "@/lib/shopping/list";

export async function generateList(week: string) {
  if (!isISODate(week)) return;
  const db = getDb();
  saveGenerated(db, week, shoppingForWeek(db, week), pantryMatcher(db));
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
