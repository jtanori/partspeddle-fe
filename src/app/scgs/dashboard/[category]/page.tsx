import { buildDashboardReadModel } from '@/domain/specification/scgs/dashboard.projection';
import { HealthOverview } from './HealthOverview';
import { DriftChart } from './DriftChart';
import { ViolationTable } from './ViolationTable';

// Mock data fetcher - in production this would be an API call
async function getDashboardData(category: string) {
    // In production, load artifacts/traces from store
    return {
        category,
        latestVerdict: { status: 'PASS' } as any,
        stabilityIndex: 95.5,
        driftTrend: { labels: ['v1', 'v2'], scores: [10, 5] },
        recentViolations: []
    };
}

export default async function DashboardPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const data = await getDashboardData(category);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">SCGS Health Dashboard: {data.category}</h1>
      <div className="grid grid-cols-2 gap-4">
        <HealthOverview verdict={data.latestVerdict} stabilityIndex={data.stabilityIndex} />
        <DriftChart trend={data.driftTrend} />
      </div>
      <ViolationTable violations={data.recentViolations} />
    </div>
  );
}
