import { createReplayStore } from '@/backend/modules/scgs';
import { buildDashboardReadModel, evaluateGovernanceDecision } from '@/backend/modules/scgs';
import type { SemanticReplayTrace } from '@/backend/modules/scgs';
import type { PTSVector, SCGSCIVerdict } from '@/backend/modules/scgs';
import { HealthOverview } from './HealthOverview';
import { DriftChart } from './DriftChart';
import { ViolationTable } from './ViolationTable';

function extractPTSVector(trace: SemanticReplayTrace): PTSVector {
  const ptsEvent = trace.events.find((e) => e.type === 'PTS_SHIFT');
  return {
    driftScore: ptsEvent?.driftScore ?? 0,
    highDrift: ptsEvent?.wasHighDrift ?? false,
  };
}

function extractLatestVerdict(trace: SemanticReplayTrace): SCGSCIVerdict {
  const ciEvent = trace.events.find((e) => e.type === 'CI_VERDICT');
  return {
    status: ciEvent?.verdict ?? 'PASS',
    reasonCodes: ciEvent?.reasonCodes ?? [],
    violations: ciEvent?.reasonCodes ?? [],
  };
}

async function getDashboardData(category: string) {
  const store = createReplayStore();
  const traces = await store.list({ categoryId: category, limit: 50 });

  if (traces.length === 0) {
    // Fallback: produce a decision from an empty evolution so the dashboard
    // renders even before the first trace is recorded.
    const decision = evaluateGovernanceDecision({
      evolution: { groupDiffs: [], facetDiffs: [], score: { severity: 'NONE' } },
      triggeredBy: 'LOCAL_RUN',
      environment: 'local',
    });

    return buildDashboardReadModel(
      category,
      [],
      [],
      [{ driftScore: decision.ptsScore, highDrift: false }],
      { status: 'PASS', reasonCodes: [], violations: [] },
    );
  }

  const artifacts = traces.map((t) => ({
    listingId: t.listingId,
    categoryId: t.categoryId,
    version: t.version,
    lineageId: `${t.traceId}` as any,
    compiled: { grouped: [], facets: {}, flat: [] } as any,
    checksum: t.snapshots[t.snapshots.length - 1]?.compiledArtifactHash ?? t.traceId,
    metadata: { createdAt: t.metadata.createdAt, compilerVersion: t.compilerVersion },
  }));

  const ptsVectors = traces.map(extractPTSVector);
  const latestVerdict = extractLatestVerdict(traces[0]);

  return buildDashboardReadModel(category, artifacts, traces, ptsVectors, latestVerdict);
}

export default async function DashboardPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const data = await getDashboardData(category);

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-xl md:text-2xl font-bold mb-6">SCGS Health Dashboard: {data.category}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <HealthOverview verdict={data.latestVerdict} stabilityIndex={data.stabilityIndex} />
        <DriftChart trend={data.driftTrend} />
      </div>
      <ViolationTable violations={data.recentViolations} />
    </div>
  );
}
