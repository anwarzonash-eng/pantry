"use server";

import { revalidatePath } from "next/cache";
import { BackupError, parseBackup, restoreAll } from "@/lib/backup";
import { getDb } from "@/lib/db";

export type RestoreState = { error?: string; done?: string };

export async function restoreBackup(_prev: RestoreState, form: FormData): Promise<RestoreState> {
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a backup file first." };
  if (form.get("confirm") !== "on") return { error: "Tick the box to confirm that everything will be replaced." };
  try {
    const { recipes } = restoreAll(getDb(), parseBackup(await file.text()));
    revalidatePath("/", "layout");
    return { done: `Restored ${recipes} recipes.` };
  } catch (err) {
    if (err instanceof BackupError) return { error: err.message };
    throw err;
  }
}
