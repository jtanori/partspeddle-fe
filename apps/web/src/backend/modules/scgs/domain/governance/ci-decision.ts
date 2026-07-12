export type CIDecisionStatus = 'PASS' | 'WARN' | 'BLOCK';

export interface CIDecision {
  status: CIDecisionStatus;
  reasonCodes: string[];
  systemState: string;
  behavioralResponse: string;
  ptsScore: number;
  governanceResult: string;
  traceId?: string;
}

export interface CIDecisionInput {
  evolution: {
    groupDiffs: { groupName: string; changeType: string }[];
    facetDiffs: { key: string; type: string }[];
    score: { severity: string };
  };
  previousArtifactHash?: string;
  currentArtifactHash?: string;
  triggeredBy: 'CI' | 'PRR' | 'MANUAL' | 'LOCAL_RUN';
  gitCommit?: string;
  environment?: 'ci' | 'local';
}
