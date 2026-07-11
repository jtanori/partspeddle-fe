import { SCGSCIVerdict } from '@/domain/specification/scgs/types';

interface HealthOverviewProps {
  verdict: SCGSCIVerdict;
  stabilityIndex: number;
}

export function HealthOverview({ verdict, stabilityIndex }: HealthOverviewProps) {
  const statusColor = verdict.status === 'PASS' ? 'bg-green-500' : verdict.status === 'WARN' ? 'bg-yellow-500' : 'bg-red-500';
  
  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-lg font-bold">System Health</h2>
      <div className="flex items-center gap-4 mt-2">
        <span className={`w-4 h-4 rounded-full ${statusColor}`} />
        <p>Verdict: {verdict.status}</p>
      </div>
      <p className="mt-2 text-2xl">Stability: {stabilityIndex.toFixed(1)}/100</p>
    </div>
  );
}
