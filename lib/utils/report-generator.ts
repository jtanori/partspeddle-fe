
import fs from 'fs';

export interface ValidationReport {
  timestamp: string;
  verdict: 'PASS' | 'FAIL';
  results: Record<string, any>;
  thresholds: Record<string, any>;
}

export function generateReport(
  filename: string,
  results: Record<string, any>,
  thresholds: Record<string, any>,
  verdict: 'PASS' | 'FAIL'
): void {
  const report: ValidationReport = {
    timestamp: new Date().toISOString(),
    verdict,
    results,
    thresholds,
  };

  if (!fs.existsSync('reports')) fs.mkdirSync('reports');
  fs.writeFileSync(`reports/${filename}`, JSON.stringify(report, null, 2));
}
