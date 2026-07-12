/**
 * DC-7.1 — Environment Drift Certification
 *
 * Compares secrets configured in Fly.io and GitHub environments against the
 * canonical environment variable schema. Reports missing required secrets and
 * orphaned secrets (present remotely but absent from the schema).
 *
 * Only secret *names* are printed. Values are never exposed.
 *
 * Usage:
 *   tsx platform/scripts/deployment/verify-environment-drift.ts --env staging
 *   tsx platform/scripts/deployment/verify-environment-drift.ts --env production
 *   pnpm delivery:verify:env-drift --env staging
 */

import { execSync } from 'node:child_process';
import {
  ENVIRONMENT_VARIABLES,
  EnvProvider,
  EnvScope,
  type EnvVarDefinition,
} from '../../../config/environment/schema';

export type Environment = 'staging' | 'production';

export const FLY_APPS: Record<Environment, string> = {
  staging: 'vintrack-stage',
  production: 'vintrack-prod',
};

export interface DriftSummary {
  environment: Environment;
  fly: {
    missing: string[];
    orphans: string[];
  };
  github: {
    missing: string[];
    orphans: string[];
  };
}

export function parseArgs(argv: string[]): { environment: Environment } {
  const envIndex = argv.indexOf('--env');
  const environment = envIndex >= 0 ? argv[envIndex + 1] : undefined;

  if (environment !== 'staging' && environment !== 'production') {
    console.error('Usage: tsx verify-environment-drift.ts --env <staging|production>');
    process.exit(2);
  }

  return { environment };
}

function runCommand(command: string[]): string {
  return execSync(command.join(' '), {
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 1024 * 1024,
  }).trim();
}

export function listFlySecrets(app: string): string[] {
  const output = runCommand(['flyctl', 'secrets', 'list', '-a', app, '--json']);
  const parsed = JSON.parse(output) as Array<{ name?: string; key?: string }>;
  return parsed.map((entry) => entry.name ?? entry.key ?? '').filter(Boolean);
}

export function listGithubSecrets(environment: Environment): string[] {
  const output = runCommand(['gh', 'secret', 'list', '--env', environment, '--json', 'name']);
  const parsed = JSON.parse(output) as Array<{ name: string }>;
  return parsed.map((entry) => entry.name).filter(Boolean);
}

export function expectedFlySecretNames(): string[] {
  return ENVIRONMENT_VARIABLES.filter((v) => v.provider === EnvProvider.FLY_SECRETS).map(
    (v) => v.name,
  );
}

function isProjectIdForEnvironment(def: EnvVarDefinition, environment: Environment): boolean {
  if (def.name === 'STAGING_SUPABASE_PROJECT_ID') return environment === 'staging';
  if (def.name === 'PRODUCTION_SUPABASE_PROJECT_ID') return environment === 'production';
  return false;
}

export function expectedGithubSecretNames(environment: Environment): string[] {
  const names: string[] = [];

  for (const def of ENVIRONMENT_VARIABLES) {
    if (def.provider !== EnvProvider.GITHUB_SECRETS) continue;

    // CI-deploy secrets shared by both environments, except project IDs which are
    // environment-specific by name.
    if (def.scope === EnvScope.CI_DEPLOY) {
      if (
        def.name === 'STAGING_SUPABASE_PROJECT_ID' ||
        def.name === 'PRODUCTION_SUPABASE_PROJECT_ID'
      ) {
        if (isProjectIdForEnvironment(def, environment)) {
          names.push(def.name);
        }
      } else {
        names.push(def.name);
      }
    }

    // Smoke-test secrets are currently only required for the staging environment.
    if (def.scope === EnvScope.SMOKE_TEST && environment === 'staging') {
      names.push(def.name);
    }
  }

  return names;
}

export function computeDrift(
  expected: string[],
  actual: string[],
): { missing: string[]; orphans: string[] } {
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);

  const missing = expected.filter((name) => !actualSet.has(name));
  const orphans = actual.filter((name) => !expectedSet.has(name));

  return { missing, orphans };
}

export function runDriftCheck(
  environment: Environment,
  listFly: (app: string) => string[] = listFlySecrets,
  listGithub: (env: Environment) => string[] = listGithubSecrets,
): DriftSummary {
  const flyApp = FLY_APPS[environment];

  const flyActual = listFly(flyApp);
  const githubActual = listGithub(environment);

  const flyExpected = expectedFlySecretNames();
  const githubExpected = expectedGithubSecretNames(environment);

  return {
    environment,
    fly: computeDrift(flyExpected, flyActual),
    github: computeDrift(githubExpected, githubActual),
  };
}

function printDriftSection(
  title: string,
  drift: { missing: string[]; orphans: string[] },
): void {
  console.log(`\n${title}`);

  if (drift.missing.length === 0 && drift.orphans.length === 0) {
    console.log('  ✓ No drift detected.');
    return;
  }

  if (drift.missing.length > 0) {
    console.log('  Missing required secrets:');
    for (const name of drift.missing) {
      console.log(`    - ${name}`);
    }
  }

  if (drift.orphans.length > 0) {
    console.log('  Orphaned secrets (not in schema):');
    for (const name of drift.orphans) {
      console.log(`    - ${name}`);
    }
  }
}

export function main(): void {
  const { environment } = parseArgs(process.argv);

  console.log(`DC-7.1 Environment Drift Certification — ${environment}`);
  console.log(`Fly.io app: ${FLY_APPS[environment]}`);
  console.log(`GitHub environment: ${environment}`);

  const summary = runDriftCheck(environment);

  printDriftSection('Fly.io runtime secrets', summary.fly);
  printDriftSection('GitHub environment secrets', summary.github);

  const hasDrift =
    summary.fly.missing.length > 0 ||
    summary.fly.orphans.length > 0 ||
    summary.github.missing.length > 0 ||
    summary.github.orphans.length > 0;

  console.log('');
  if (hasDrift) {
    console.error('Environment drift detected.');
    process.exit(1);
  }

  console.log('Environment drift certification passed.');
}

const isMain =
  import.meta.url.startsWith('file:') && process.argv[1] === new URL(import.meta.url).pathname;

if (isMain) {
  main();
}
