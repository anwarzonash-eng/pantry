"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { addToPantry, removeFromPantry } from "@/lib/pantry";

export async function addPantryItems(form: FormData) {
  addToPantry(getDb(), String(form.get("items") ?? ""));
  revalidatePath("/pantry");
}

export async function removePantryItem(id: number) {
  removeFromPantry(getDb(), id);
  revalidatePath("/pantry");
}
