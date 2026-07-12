/**
 * Validates the delivery manifest against its JSON schema.
 *
 * Usage:
 *   tsx platform/scripts/deployment/validate-delivery-manifest.ts
 */

import { readFileSync } from 'node:fs';
import { loadDeliveryManifest } from '@operations/delivery/manifests/manifest';

function validate(): void {
  const manifest = loadDeliveryManifest();

  const errors: string[] = [];

  if (!manifest.version) errors.push('version is required');
  if (!manifest.project) errors.push('project is required');
  if (!manifest.environments || Object.keys(manifest.environments).length === 0) {
    errors.push('at least one environment is required');
  }
  for (const [name, env] of Object.entries(manifest.environments)) {
    if (!env.appUrl) errors.push(`environment.${name}.appUrl is required`);
    if (!env.flyApp) errors.push(`environment.${name}.flyApp is required`);
    if (!env.githubEnvironment) errors.push(`environment.${name}.githubEnvironment is required`);
    if (!env.healthEndpoint) errors.push(`environment.${name}.healthEndpoint is required`);
  }
  if (!manifest.deployment) errors.push('deployment is required');
  if (!manifest.verification) errors.push('verification is required');
  if (!manifest.observability) errors.push('observability is required');
  if (!manifest.recovery) errors.push('recovery is required');
  if (!manifest.certification) errors.push('certification is required');

  if (manifest.verification?.healthContract) {
    const hc = manifest.verification.healthContract;
    if (!hc.contractVersion) errors.push('verification.healthContract.contractVersion is required');
    if (!hc.supportedVersions || hc.supportedVersions.length === 0) {
      errors.push('verification.healthContract.supportedVersions must not be empty');
    }
    if (!hc.requiredChecks || hc.requiredChecks.length === 0) {
      errors.push('verification.healthContract.requiredChecks must not be empty');
    }
  } else {
    errors.push('verification.healthContract is required');
  }

  // Verify referenced files exist.
  try {
    readFileSync(manifest.recovery.runbookPath, 'utf-8');
  } catch {
    errors.push(`recovery runbook not found at ${manifest.recovery.runbookPath}`);
  }

  if (errors.length > 0) {
    console.error('Delivery manifest validation failed:');
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }

  console.log('Delivery manifest is valid.');
}

validate();
