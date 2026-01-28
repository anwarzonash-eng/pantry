// Dates in the plan are plain "YYYY-MM-DD" strings in local time, so a meal
// never moves to another day because of time zones.

const pad = (n: number) => String(n).padStart(2, "0");

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isISODate(text: string | undefined): text is string {
  return !!text && /^\d{4}-\d{2}-\d{2}$/.test(text) && toISODate(parseISODate(text)) === text;
}

export function addDays(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** Monday of the week the date is in. */
export function startOfWeek(iso: string): string {
  const day = parseISODate(iso).getDay(); // 0 = Sunday
  // Sunday belongs to the week that started six days earlier, not the next one
  return addDays(iso, day === 0 ? -6 : 1 - day);
}

export function weekDays(monday: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export function formatDay(iso: string): string {
  return parseISODate(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}
