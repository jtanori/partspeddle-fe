import { PartCondition } from "@/types";

// Human-readable mapping
const conditionLabels: Record<PartCondition, string> = {
  NEW: "New",
  REMANUFACTURED: "Remanufactured",
  USED_EXCELLENT: "Used Excellent",
  USED_GOOD: "Used Good",
  USED_FAIR: "Used Fair",
  FOR_PARTS: "For Parts",
};

export const getConditionLabel = (cond: PartCondition): string => {
  return conditionLabels[cond] || cond;
};

export const getConditionColor = (cond: PartCondition): string => {
  switch (cond) {
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
