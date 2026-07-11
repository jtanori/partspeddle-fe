export function ViolationTable({ violations }: { violations: unknown[] }) {
  return (
    <div className="p-4 border rounded mt-4">
      <h2 className="font-semibold">Recent Violations</h2>
      {violations.length === 0 ? (
        <p>No violations.</p>
      ) : (
        <pre>{JSON.stringify(violations, null, 2)}</pre>
      )}
    </div>
  );
}
