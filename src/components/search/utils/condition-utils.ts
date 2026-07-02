import { PartCondition } from "@/types";

const conditionLabels: Record<PartCondition, string> = {
  NEW: "New",
  REMANUFACTURED: "Remanufactured",
  USED_EXCELLENT: "Used Excellent",
  USED_GOOD: "Used Good",
  USED_FAIR: "Used Fair",
  FOR_PARTS: "For Parts",
};

export const getConditionLabel = (cond: PartCondition | string): string => {
  const normalized = typeof cond === "string" ? normalizeCondition(cond) : cond;
  return conditionLabels[normalized] || String(cond);
};

export function normalizeCondition(
  condition?: string | PartCondition | null,
): PartCondition {
  if (!condition) return "USED_GOOD";

  const raw = String(condition).trim();
  const upper = raw.toUpperCase().replace(/[\s-]+/g, "_");

  if (upper in conditionLabels) {
    return upper as PartCondition;
  }

  const lowered = raw.toLowerCase();
  if (lowered.includes("new") || lowered.includes("original")) return "NEW";
  if (lowered.includes("reman")) return "REMANUFACTURED";
  if (lowered.includes("excellent")) return "USED_EXCELLENT";
  if (lowered.includes("fair")) return "USED_FAIR";
  if (lowered.includes("parts")) return "FOR_PARTS";

  return "USED_GOOD";
}

export const getConditionColor = (cond: PartCondition | string): string => {
  const normalized = typeof cond === "string" ? normalizeCondition(cond) : cond;

  switch (normalized) {
    case "NEW":
      return "bg-emerald-600 text-white";
    case "REMANUFACTURED":
      return "bg-blue-600 text-white";
    case "USED_EXCELLENT":
      return "bg-emerald-500 text-white";
    case "USED_GOOD":
      return "bg-amber-500 text-white";
    case "USED_FAIR":
      return "bg-orange-500 text-white";
    case "FOR_PARTS":
      return "bg-red-600 text-white";
    default:
      return "bg-zinc-500 text-white";
  }
};
