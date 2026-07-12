/**
 * Deployment Verification (DC-6 + DC-6.5)
 *
 * Polls the application's health endpoint until the operational contract is
 * satisfied or a timeout is reached.
 *
 * Usage:
 *   tsx platform/scripts/deployment/verify-deployment.ts https://stage.partspeddle.com
 *   tsx platform/scripts/deployment/verify-deployment.ts --environment staging
 *   DEPLOYMENT_URL=https://stage.partspeddle.com tsx platform/scripts/deployment/verify-deployment.ts
 */

import {
  HEALTH_CONTRACT_VERSION,
  REQUIRED_HEALTH_CHECKS,
  validateHealthContract,
  type HealthReport,
} from '../../operations/kernel/contracts/health.contract';
import { getEnvironment } from '@operations/delivery/manifests/manifest';

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
  console.error('Usage: tsx platform/scripts/deployment/verify-deployment.ts <url>');
  console.error('   or: tsx platform/scripts/deployment/verify-deployment.ts --environment staging');
  process.exit(1);
}

const baseUrl = resolveBaseUrl();
const timeoutMs = Number(process.env.VERIFY_TIMEOUT_MS || '120000');
const intervalMs = Number(process.env.VERIFY_INTERVAL_MS || '5000');
const requiredChecks = (process.env.VERIFY_REQUIRED_CHECKS || REQUIRED_HEALTH_CHECKS.join(',')).split(',');
const supportedContractVersions = process.env.VERIFY_SUPPORTED_CONTRACT_VERSIONS
  ? process.env.VERIFY_SUPPORTED_CONTRACT_VERSIONS.split(',')
  : [HEALTH_CONTRACT_VERSION];

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

  const body = (await response.json()) as unknown;
  const validation = validateHealthContract(body, {
    requiredChecks,
    supportedContractVersions,
  });

  if (!validation.valid || !validation.report) {
    throw new Error(validation.errors.join('; '));
  }

  return validation.report;
}

async function verifyDeployment(): Promise<void> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const report = await fetchHealth();
      console.log(`Health status: ${report.status}`);
      console.log(`  contractVersion: ${report.contractVersion}`);
      console.log(`  version: ${report.version}`);
      console.log(`  environment: ${report.environment}`);

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
