/**
 * Health Contract Assertion (DC-6.5)
 *
 * Fetches the application health endpoint once and asserts that the response
 * satisfies the operational contract. This script is intended to run in CI
 * immediately after deployment verification succeeds.
 *
 * Usage:
 *   tsx platform/scripts/deployment/assert-health-contract.ts https://stage.partspeddle.com
 *   tsx platform/scripts/deployment/assert-health-contract.ts --environment staging
 *   DEPLOYMENT_URL=https://stage.partspeddle.com tsx platform/scripts/deployment/assert-health-contract.ts
 */

import {
  HEALTH_CONTRACT_VERSION,
  REQUIRED_HEALTH_CHECKS,
  validateHealthContract,
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
  process.exit(1);
}

const baseUrl = resolveBaseUrl();
const requiredChecks = (process.env.VERIFY_REQUIRED_CHECKS || REQUIRED_HEALTH_CHECKS.join(',')).split(',');
const supportedContractVersions = process.env.VERIFY_SUPPORTED_CONTRACT_VERSIONS
  ? process.env.VERIFY_SUPPORTED_CONTRACT_VERSIONS.split(',')
  : [HEALTH_CONTRACT_VERSION];

const healthUrl = `${baseUrl.replace(/\/$/, '')}/api/health`;

async function assertContract(): Promise<void> {
  const response = await fetch(healthUrl, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    console.error(`Health endpoint returned HTTP ${response.status}`);
    process.exit(1);
  }

  const body = (await response.json()) as unknown;
  const validation = validateHealthContract(body, {
    requiredChecks,
    supportedContractVersions,
  });

  if (!validation.valid || !validation.report) {
    console.error('Health contract assertion failed:');
    for (const error of validation.errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }

  const report = validation.report;
  console.log('Health contract assertion passed.');
  console.log(`  contractVersion: ${report.contractVersion}`);
  console.log(`  status: ${report.status}`);
  console.log(`  version: ${report.version}`);
  console.log(`  environment: ${report.environment}`);
  for (const [name, check] of Object.entries(report.checks)) {
    console.log(`  ${check.status === 'ok' ? '✓' : '✗'} ${name}: ${check.status}`);
  }
}

assertContract().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
