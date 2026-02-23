"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { isISODate } from "@/lib/dates";
import { shoppingForWeek } from "@/lib/shopping/fromPlan";
import { saveGenerated, setChecked } from "@/lib/shopping/list";

export async function generateList(week: string) {
  if (!isISODate(week)) return;
  const db = getDb();
  saveGenerated(db, week, shoppingForWeek(db, week));
  revalidatePath("/shopping");
}

export async function toggleItem(id: number, checked: boolean) {
  setChecked(getDb(), id, checked);
  revalidatePath("/shopping");
}
