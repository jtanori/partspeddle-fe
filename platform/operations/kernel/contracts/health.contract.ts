/**
 * Health Contract (DC-6.5)
 *
 * Defines the operational contract between the running application and the
 * deployment verification toolchain. This is the single source of truth for:
 *
 *   - the shape of /api/health responses,
 *   - the supported contract versions,
 *   - the required dependency checks,
 *   - the validation logic consumed by verify-deployment.ts and CI.
 *
 * Any change to the health endpoint contract must be reflected here and the
 * contract version must be bumped according to semver rules.
 */

import { z } from 'zod';

export const HEALTH_CONTRACT_VERSION = '1.0.0';

export const SUPPORTED_HEALTH_CONTRACT_VERSIONS = ['1.0.0'] as const;

export const REQUIRED_HEALTH_CHECKS = ['environment', 'supabase', 'algolia'] as const;

export const healthCheckResultSchema = z.object({
  status: z.enum(['ok', 'error']),
  latencyMs: z.number(),
  message: z.string().optional(),
});

export const healthBuildMetadataSchema = z.object({
  sha: z.string().optional(),
  timestamp: z.string().optional(),
  image: z.string().optional(),
});

export const healthReportSchema = z.object({
  contractVersion: z.string(),
  status: z.enum(['ok', 'degraded']),
  version: z.string().min(1),
  environment: z.string().min(1),
  message: z.string().optional(),
  checks: z.record(healthCheckResultSchema),
  build: healthBuildMetadataSchema.optional(),
});

export type HealthCheckResult = z.infer<typeof healthCheckResultSchema>;
export type HealthBuildMetadata = z.infer<typeof healthBuildMetadataSchema>;
export type HealthReport = z.infer<typeof healthReportSchema>;

export interface HealthContractValidationResult {
  valid: boolean;
  errors: string[];
  report?: HealthReport;
}

/**
 * Validates that a health report satisfies the operational contract.
 *
 * @param report the parsed JSON body from /api/health
 * @param options.requiredChecks optional list of checks that must be present and ok
 * @param options.supportedContractVersions optional list of supported contract versions
 */
export function validateHealthContract(
  report: unknown,
  options: {
    requiredChecks?: readonly string[];
    supportedContractVersions?: readonly string[];
  } = {},
): HealthContractValidationResult {
  const requiredChecks = options.requiredChecks ?? REQUIRED_HEALTH_CHECKS;
  const supportedContractVersions =
    options.supportedContractVersions ?? SUPPORTED_HEALTH_CONTRACT_VERSIONS;

  const parseResult = healthReportSchema.safeParse(report);
  if (!parseResult.success) {
    return {
      valid: false,
      errors: parseResult.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    };
  }

  const health = parseResult.data;
  const errors: string[] = [];

  if (!supportedContractVersions.includes(health.contractVersion)) {
    errors.push(
      `Unsupported health contract version: ${health.contractVersion} (supported: ${supportedContractVersions.join(', ')})`,
    );
  }

  for (const checkName of requiredChecks) {
    const check = health.checks[checkName];
    if (!check) {
      errors.push(`Required health check "${checkName}" is missing`);
      continue;
    }
    if (check.status !== 'ok') {
      errors.push(`Required health check "${checkName}" is not ok: ${check.status}`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors, report: health };
  }

  return { valid: true, errors: [], report: health };
}
