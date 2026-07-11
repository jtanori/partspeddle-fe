export function HealthOverview({
  verdict,
  stabilityIndex,
}: {
  verdict: { status: string };
  stabilityIndex: number;
}) {
  return (
    <div className="p-4 border rounded">
      <h2 className="font-semibold">Health Overview</h2>
      <p>Status: {verdict.status}</p>
      <p>Stability: {stabilityIndex}</p>
    </div>
  );
}
