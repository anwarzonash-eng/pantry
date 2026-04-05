/** 45 -> "45 min", 90 -> "1 h 30 min", 120 -> "2 h" */
export function formatMinutes(total: number): string {
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function totalMinutes(r: { prepMinutes: number | null; cookMinutes: number | null }): number | null {
  if (r.prepMinutes == null && r.cookMinutes == null) return null;
  return (r.prepMinutes ?? 0) + (r.cookMinutes ?? 0);
}
