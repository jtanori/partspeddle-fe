import { SystemState, BehavioralResponse } from '../domain/compiled-semantic-artifact';

export function evaluateSystemState(ciStatus: string, driftScore: number): SystemState {
  if (ciStatus === "BLOCK") return "BLOCKED";
  if (driftScore > 80) return "DRIFTING";
  if (driftScore > 40) return "DEGRADED";
  return "STABLE";
}

export function getBehavioralResponse(state: SystemState): BehavioralResponse {
  switch (state) {
    case "STABLE":
      return {
        allowedActions: ["development", "pr_flow"],
        forbiddenActions: [],
        enforcementLevel: "NONE"
      };
    case "DEGRADED":
      return {
        allowedActions: ["compiler_changes", "replay_inspection", "dashboard_review"],
        forbiddenActions: ["silent_ui_changes", "schema_mutation"],
        enforcementLevel: "REVIEW"
      };
    case "DRIFTING":
      return {
        allowedActions: ["scgs_aligned_fixes", "replay_mandatory"],
        forbiddenActions: ["non_scgs_changes"],
        enforcementLevel: "BLOCK" // Requires PRR pass
      };
    case "BLOCKED":
      return {
        allowedActions: ["replay_debugging"],
        forbiddenActions: ["projection_changes", "ui_changes"],
        enforcementLevel: "BLOCK"
      };
    case "COMPILATION_INCONSISTENT":
      return {
        allowedActions: ["kernel_fix"],
        forbiddenActions: ["all_downstream_writes"],
        enforcementLevel: "BLOCK"
      };
  }
}
