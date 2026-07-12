interface DriftTrendProps {
  trend: { labels: string[]; scores: number[] };
}

export function DriftChart({ trend }: DriftTrendProps) {
  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-lg font-bold">Drift Trend</h2>
      <div className="flex items-end gap-2 h-40 mt-4 border-b">
        {trend.scores.map((score, i) => (
          <div 
            key={trend.labels[i]}
            className="bg-blue-500 w-8"
            style={{ height: `${score}%` }}
            title={`Version ${trend.labels[i]}: ${score}`}
          />
        ))}
      </div>
    </div>
  );
}
