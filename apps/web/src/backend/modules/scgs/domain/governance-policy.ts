import { EvolutionReport, GovernancePolicy, GovernanceResult } from './compiled-semantic-artifact';

export const DEFAULT_POLICY: GovernancePolicy = {
  allowGroupAdditions: true,
  allowFacetAdditions: true,
  allowOrderChanges: "review",
  allowGroupRemovals: false,
  allowFacetRemovals: false,
  requireApprovalForBreakingChanges: true,
};

export function evaluateGovernance(
  evolution: EvolutionReport,
  policy: GovernancePolicy
): GovernanceResult {
  const violations: string[] = [];

  for (const d of evolution.groupDiffs) {
    if (d.changeType === "REMOVED" && !policy.allowGroupRemovals) {
      violations.push(`GROUP_REMOVAL:${d.groupName}`);
    }
    if (d.changeType === "ADDED" && !policy.allowGroupAdditions) {
      violations.push(`GROUP_ADDITION:${d.groupName}`);
    }
    if (d.changeType === "ORDER_CHANGED" && policy.allowOrderChanges === "never") {
      violations.push(`ORDER_CHANGE:${d.groupName}`);
    }
  }

  for (const f of evolution.facetDiffs) {
    if (f.type === "REMOVED" && !policy.allowFacetRemovals) {
      violations.push(`FACET_REMOVAL:${f.key}`);
    }
    if (f.type === "ADDED" && !policy.allowFacetAdditions) {
      violations.push(`FACET_ADDITION:${f.key}`);
    }
  }

  const status =
    violations.length === 0 ? "PASS"
    : evolution.score.severity === "BREAKING" ? "BLOCK"
    : "REVIEW";

  return { status, violations };
}
