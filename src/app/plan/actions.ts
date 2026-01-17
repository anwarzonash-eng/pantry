"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { isISODate } from "@/lib/dates";
import { addToPlan, removeFromPlan, SLOTS, type Slot } from "@/lib/plan";

export async function planMeal(form: FormData) {
  const date = String(form.get("date") ?? "");
  const slot = String(form.get("slot") ?? "") as Slot;
  const recipeId = Number(form.get("recipeId"));
  if (!isISODate(date) || !SLOTS.includes(slot) || !recipeId) return;
  addToPlan(getDb(), { date, slot, recipeId });
  revalidatePath("/plan");
}

export async function unplanMeal(id: number) {
  removeFromPlan(getDb(), id);
  revalidatePath("/plan");
}
