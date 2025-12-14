/** "Crème Brûlée (easy)" -> "creme-brulee-easy" */
export function slugify(text: string): string {
  const slug = text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || "recipe";
}

/** slug, slug-2, slug-3, ... whichever is free. */
export function uniqueSlug(taken: (slug: string) => boolean, text: string): string {
  const base = slugify(text);
  if (!taken(base)) return base;
  for (let n = 2; ; n++) {
    const candidate = `${base}-${n}`;
    if (!taken(candidate)) return candidate;
  }
}
