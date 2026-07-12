import type { CIDecision, CIDecisionInput } from '../domain/governance/ci-decision';
import type { EvolutionReport, GovernanceResult } from '../domain/compiled-semantic-artifact';
import { evaluatePTS } from '../domain/pts';
import { evaluateGovernance, DEFAULT_POLICY } from '../domain/governance-policy';
import {
  evaluateSystemState,
  getBehavioralResponse,
} from '../infrastructure/governance-controller';

function buildEvolutionReport(input: CIDecisionInput): EvolutionReport {
  return {
    type: 'SAFE',
    groupDiffs: input.evolution.groupDiffs.map((d) => ({
      groupName: d.groupName,
      changeType: d.changeType as EvolutionReport['groupDiffs'][number]['changeType'],
      before: undefined,
      after: undefined,
    })),
    facetDiffs: input.evolution.facetDiffs.map((f) => ({
      key: f.key,
      type: f.type as EvolutionReport['facetDiffs'][number]['type'],
      before: undefined,
      after: undefined,
    })),
    score: {
      severity: input.evolution.score.severity as EvolutionReport['score']['severity'],
    },
    requiresApproval: false,
  };
}

export function evaluateGovernanceDecision(input: CIDecisionInput): CIDecision {
  const evolution = buildEvolutionReport(input);
  const pts = evaluatePTS(evolution);
  const governanceResult: GovernanceResult = evaluateGovernance(evolution, DEFAULT_POLICY);

  const ciStatus: 'PASS' | 'WARN' | 'BLOCK' =
    governanceResult.status === 'BLOCK'
      ? 'BLOCK'
      : governanceResult.status === 'REVIEW'
        ? 'WARN'
        : 'PASS';

  const systemState = evaluateSystemState(ciStatus, pts.driftScore);
  const behavioralResponse = getBehavioralResponse(systemState);

  const reasonCodes: string[] = [
    `PTS:${pts.driftScore.toFixed(2)}`,
    `GOVERNANCE:${governanceResult.status}`,
    `STATE:${systemState}`,
    ...governanceResult.violations,
  ];

  return {
    status: ciStatus,
    reasonCodes,
    systemState,
    behavioralResponse: behavioralResponse.enforcementLevel,
    ptsScore: pts.driftScore,
    governanceResult: governanceResult.status,
  };
}
