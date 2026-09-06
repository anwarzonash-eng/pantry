"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { deleteTag, renameTag } from "@/lib/recipes";

export async function rename(from: string, form: FormData) {
  renameTag(getDb(), from, String(form.get("name") ?? ""));
  revalidatePath("/", "layout");
}

export async function remove(name: string) {
  deleteTag(getDb(), name);
  revalidatePath("/", "layout");
}
