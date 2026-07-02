export function DriftChart({ trend }: { trend: { labels: string[]; scores: number[] } }) {
  return (
    <div className="p-4 border rounded">
      <h2 className="font-semibold">Drift Trend</h2>
      <pre>{JSON.stringify(trend, null, 2)}</pre>
    </div>
  );
}
