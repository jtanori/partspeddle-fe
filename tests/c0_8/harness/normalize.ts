export function normalizeString(v: any): string {
  return String(v ?? "").trim().toLowerCase();
}

export function normalizeValue(v: any): string | number | boolean {
  if (typeof v === "number") return v;
  if (typeof v === "boolean") return v;
  return normalizeString(v);
}
