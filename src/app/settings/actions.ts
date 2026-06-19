"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { parseSystem, UNIT_COOKIE } from "@/lib/ingredients/units";

export async function saveUnits(form: FormData) {
  const jar = await cookies();
  const system = parseSystem(String(form.get("units") ?? ""));
  if (system) jar.set(UNIT_COOKIE, system, { maxAge: 60 * 60 * 24 * 365 * 2, sameSite: "lax", path: "/" });
  else jar.delete(UNIT_COOKIE);
  revalidatePath("/", "layout");
}
