/**
 * Deployment Contract (DC-6 + DC-6.5)
 *
 * Defines the operational contract between the CI/CD pipeline and the running
 * application. The deployment verification script consumes this contract to
 * determine whether a deployment is healthy and certified.
 */

import {
  HEALTH_CONTRACT_VERSION,
  validateHealthContract,
  type HealthContractValidationResult,
} from './health.contract';

export interface DeploymentVerificationOptions {
  baseUrl: string;
  timeoutMs: number;
  intervalMs: number;
  requiredChecks?: readonly string[];
  supportedContractVersions?: readonly string[];
}

export interface DeploymentVerificationResult {
  success: boolean;
  durationMs: number;
  healthReport?: unknown;
  errors: string[];
}

export { HEALTH_CONTRACT_VERSION, validateHealthContract, type HealthContractValidationResult };
