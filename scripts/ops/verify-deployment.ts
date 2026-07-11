/**
 * Deployment Verification (DC-6 + DC-6.5)
 *
 * Polls the application's health endpoint until all checks pass or a timeout
 * is reached. Validates the health response contract (status, version,
 * environment, checks, build metadata).
 *
 * Usage:
 *   tsx scripts/ops/verify-deployment.ts https://stage.partspeddle.com
 *   tsx scripts/ops/verify-deployment.ts --environment staging
 *   DEPLOYMENT_URL=https://stage.partspeddle.com tsx scripts/ops/verify-deployment.ts
 */

import { getEnvironment, interpolateCommand } from '../../operations/delivery/manifests/manifest';

interface DependencyCheckResult {
  status: 'ok' | 'error';
  latencyMs: number;
  message?: string;
}

interface HealthReport {
  status: 'ok' | 'degraded';
  version: string;
  environment: string;
  message?: string;
  checks: Record<string, DependencyCheckResult>;
  build?: {
    sha?: string;
    timestamp?: string;
    image?: string;
  };
}

function resolveBaseUrl(): string {
  const args = process.argv.slice(2);

  const envIndex = args.findIndex((arg) => arg === '--environment' || arg === '-e');
  if (envIndex !== -1 && args[envIndex + 1]) {
    const environment = args[envIndex + 1];
    const env = getEnvironment(environment);
    return env.appUrl;
  }

  const positionalUrl = args.find((arg) => !arg.startsWith('-'));
  if (positionalUrl) {
    return positionalUrl;
  }

  if (process.env.DEPLOYMENT_URL) {
    return process.env.DEPLOYMENT_URL;
  }

  console.error('Error: deployment URL or --environment is required.');
  console.error('Usage: tsx scripts/ops/verify-deployment.ts <url>');
  console.error('   or: tsx scripts/ops/verify-deployment.ts --environment staging');
  process.exit(1);
}

const baseUrl = resolveBaseUrl();
const timeoutMs = Number(process.env.VERIFY_TIMEOUT_MS || '120000');
const intervalMs = Number(process.env.VERIFY_INTERVAL_MS || '5000');
const requiredChecks = (process.env.VERIFY_REQUIRED_CHECKS || 'environment,supabase,algolia').split(',');
const healthUrl = `${baseUrl.replace(/\/$/, '')}/api/health`;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function validateContract(report: unknown): HealthReport {
  if (typeof report !== 'object' || report === null) {
    throw new Error('Health endpoint returned non-object response');
  }

  const r = report as Partial<HealthReport>;

  if (r.status !== 'ok' && r.status !== 'degraded') {
    throw new Error(`Invalid health status: ${String(r.status)}`);
  }
  if (typeof r.version !== 'string' || r.version.length === 0) {
    throw new Error('Missing or invalid health response version');
  }
  if (typeof r.environment !== 'string' || r.environment.length === 0) {
    throw new Error('Missing or invalid health response environment');
  }
  if (typeof r.checks !== 'object' || r.checks === null) {
    throw new Error('Missing or invalid health response checks');
  }

  for (const checkName of requiredChecks) {
    const check = r.checks[checkName];
    if (!check || typeof check !== 'object') {
      throw new Error(`Required health check "${checkName}" is missing`);
    }
    if (check.status !== 'ok' && check.status !== 'error') {
      throw new Error(`Invalid status for health check "${checkName}": ${String(check.status)}`);
    }
    if (typeof check.latencyMs !== 'number') {
      throw new Error(`Invalid latency for health check "${checkName}"`);
    }
  }

  return r as HealthReport;
}

async function fetchHealth(): Promise<HealthReport> {
  const response = await fetch(healthUrl, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Health endpoint returned HTTP ${response.status}`);
  }

  return validateContract(await response.json());
}

async function verifyDeployment(): Promise<void> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const report = await fetchHealth();
      console.log(`Health status: ${report.status}`);
      console.log(`  version: ${report.version}`);
      console.log(`  environment: ${report.environment}`);

      for (const [name, check] of Object.entries(report.checks)) {
        const indicator = check.status === 'ok' ? '✓' : '✗';
        console.log(`  ${indicator} ${name}: ${check.status} (${check.latencyMs}ms)${check.message ? ` — ${check.message}` : ''}`);
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

export { interpolateCommand };
