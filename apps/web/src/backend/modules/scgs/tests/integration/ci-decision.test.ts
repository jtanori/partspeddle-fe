import { describe, it, expect } from 'vitest';
import { evaluateGovernanceDecision } from '../../application/evaluate-governance';
import type { CIDecisionInput } from '../../domain/governance/ci-decision';

function makeInput(overrides: Partial<CIDecisionInput> = {}): CIDecisionInput {
  return {
    evolution: { groupDiffs: [], facetDiffs: [], score: { severity: 'NONE' } },
    previousArtifactHash: 'prev',
    currentArtifactHash: 'curr',
    triggeredBy: 'CI',
    gitCommit: 'abc123',
    environment: 'ci',
    ...overrides,
  };
}

describe('evaluateGovernanceDecision', () => {
  it('returns PASS for no changes', () => {
    const decision = evaluateGovernanceDecision(makeInput());
    expect(decision.status).toBe('PASS');
    expect(decision.governanceResult).toBe('PASS');
    expect(decision.ptsScore).toBe(0);
  });

  it('returns BLOCK for group removal', () => {
    const input = makeInput({
      evolution: {
        groupDiffs: [{ groupName: 'engine', changeType: 'REMOVED' }],
        facetDiffs: [],
        score: { severity: 'BREAKING' },
      },
    });
    const decision = evaluateGovernanceDecision(input);
    expect(decision.status).toBe('BLOCK');
    expect(decision.governanceResult).toBe('BLOCK');
    expect(decision.reasonCodes).toContain('GROUP_REMOVAL:engine');
  });

  it('returns WARN for facet removal', () => {
    const input = makeInput({
      evolution: {
        groupDiffs: [],
        facetDiffs: [{ key: 'color', type: 'REMOVED' }],
        score: { severity: 'NON_BREAKING' },
      },
    });
    const decision = evaluateGovernanceDecision(input);
    expect(decision.status).toBe('WARN');
    expect(decision.governanceResult).toBe('REVIEW');
    expect(decision.reasonCodes).toContain('FACET_REMOVAL:color');
  });

  it('includes system state and behavioral response', () => {
    const decision = evaluateGovernanceDecision(makeInput());
    expect(decision.systemState).toBe('STABLE');
    expect(decision.behavioralResponse).toBe('NONE');
  });
});
