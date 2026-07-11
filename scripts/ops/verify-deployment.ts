/**
 * Deployment Verification (DC-6)
 *
 * Polls the application's health endpoint until all checks pass or a timeout
 * is reached. This script is intended to run after a Fly.io deployment from
 * GitHub Actions.
 *
 * Usage:
 *   tsx scripts/ops/verify-deployment.ts https://stage.partspeddle.com
 *   DEPLOYMENT_URL=https://stage.partspeddle.com tsx scripts/ops/verify-deployment.ts
 */

interface DependencyCheckResult {
  status: 'ok' | 'error';
  latencyMs: number;
  message?: string;
}

interface HealthReport {
  status: 'ok' | 'degraded';
  message?: string;
  checks: Record<string, DependencyCheckResult>;
}

const baseUrl = process.argv[2] || process.env.DEPLOYMENT_URL;
if (!baseUrl) {
  console.error('Error: deployment URL is required.');
  console.error('Usage: tsx scripts/ops/verify-deployment.ts <url>');
  process.exit(1);
}

const timeoutMs = Number(process.env.VERIFY_TIMEOUT_MS || '120000');
const intervalMs = Number(process.env.VERIFY_INTERVAL_MS || '5000');
const healthUrl = `${baseUrl.replace(/\/$/, '')}/api/health`;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchHealth(): Promise<HealthReport> {
  const response = await fetch(healthUrl, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Health endpoint returned HTTP ${response.status}`);
  }

  return (await response.json()) as HealthReport;
}

async function verifyDeployment(): Promise<void> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const report = await fetchHealth();
      console.log(`Health status: ${report.status}`);

      for (const [name, check] of Object.entries(report.checks)) {
        const indicator = check.status === 'ok' ? '✓' : '✗';
        console.log(
          `  ${indicator} ${name}: ${check.status} (${check.latencyMs}ms)${check.message ? ` — ${check.message}` : ''}`,
        );
      }

      if (report.status === 'ok') {
        console.log('Deployment verification passed.');
        process.exit(0);
      }

      console.log('Health checks reported degraded. Retrying...');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`Health check request failed: ${message}. Retrying...`);
    }

    await sleep(intervalMs);
  }

  console.error(`Deployment verification timed out after ${timeoutMs}ms.`);
  process.exit(1);
}

verifyDeployment();
