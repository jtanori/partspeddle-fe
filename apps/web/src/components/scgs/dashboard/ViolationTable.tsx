interface ViolationTableProps {
  violations: Array<{ version: string; violations: string[]; timestamp: string; }>;
}

export function ViolationTable({ violations }: ViolationTableProps) {
  return (
    <div className="p-4 border rounded shadow mt-4">
      <h2 className="text-lg font-bold">Recent Violations</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px] mt-2 text-left">
        <thead>
          <tr className="text-left">
            <th>Version</th>
            <th>Violations</th>
          </tr>
        </thead>
        <tbody>
          {violations.map((v, i) => (
            <tr key={i} className="border-t">
              <td>{v.version}</td>
              <td>{v.violations.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
