import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface DeliveryEnvironment {
  name: string;
  appUrl: string;
  flyApp: string;
  githubEnvironment: string;
  supabaseProjectIdSecret?: string;
  healthEndpoint: string;
}

export interface DeploymentConfig {
  topology: string[];
  rollbackStrategy: string;
  healthEndpoint: string;
  requiredSecretsProvider?: string[];
}

export interface VerificationStep {
  name: string;
  description: string;
  command: string;
}

export interface VerificationConfig {
  sequence: VerificationStep[];
  requiredHealthChecks: string[];
  postDeployChecks: string[];
}

export interface ObservabilityConfig {
  deploymentRecordsDir: string;
  requiredMetadata: string[];
}

export interface RecoveryConfig {
  runbookPath: string;
  rollbackCommands: Record<string, string>;
  healthCheckCommands: Record<string, string>;
}

export interface CertificationConfig {
  gates: string[];
  blockingGatesForProduction: string[];
}

export interface DeliveryManifest {
  version: string;
  project: string;
  description?: string;
  environments: Record<string, DeliveryEnvironment>;
  deployment: DeploymentConfig;
  verification: VerificationConfig;
  observability: ObservabilityConfig;
  recovery: RecoveryConfig;
  certification: CertificationConfig;
}

const MANIFEST_PATH = join(__dirname, 'delivery.manifest.json');

export function loadDeliveryManifest(): DeliveryManifest {
  const raw = readFileSync(MANIFEST_PATH, 'utf-8');
  return JSON.parse(raw) as DeliveryManifest;
}

export function getEnvironment(name: string): DeliveryEnvironment {
  const manifest = loadDeliveryManifest();
  const env = manifest.environments[name];
  if (!env) {
    throw new Error(`Environment "${name}" not found in delivery manifest`);
  }
  return env;
}

export function interpolateCommand(command: string, environment: string): string {
  const env = getEnvironment(environment);
  return command
    .replace(/\{appUrl\}/g, env.appUrl)
    .replace(/\{environment\}/g, environment)
    .replace(/\{flyApp\}/g, env.flyApp)
    .replace(/\{healthEndpoint\}/g, env.healthEndpoint);
}
