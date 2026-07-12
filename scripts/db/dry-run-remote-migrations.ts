/**
 * Dry-run remote migration application.
 *
 * Links to the requested Supabase project (staging or production), runs
 * `supabase db push --dry-run`, prints the migrations that would be applied,
 * and restores the previously linked project.
 *
 * Usage:
 *   pnpm db:dry-run:staging
 *   pnpm db:dry-run:production
 *
 * Required environment variables:
 *   - STAGING_SUPABASE_PROJECT_ID
 *   - PRODUCTION_SUPABASE_PROJECT_ID
 *   - SUPABASE_ACCESS_TOKEN (for the Supabase CLI)
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');
const PROJECT_REF_FILE = path.join(REPO_ROOT, 'supabase', '.temp', 'project-ref');

type Environment = 'staging' | 'production';

function resolveEnvArg(): Environment {
  const args = process.argv.slice(2);
  const envFlag = args.find((a) => a.startsWith('--env='));
  const envNext = args[args.indexOf('--env') + 1];
  const value = envFlag ? envFlag.split('=')[1] : envNext;

  if (value !== 'staging' && value !== 'production') {
    console.error('Usage: tsx scripts/db/dry-run-remote-migrations.ts --env staging|production');
    process.exit(1);
  }
  return value;
}

function getProjectRef(env: Environment): string {
  const key = env === 'staging' ? 'STAGING_SUPABASE_PROJECT_ID' : 'PRODUCTION_SUPABASE_PROJECT_ID';
  const ref = process.env[key];
  if (!ref) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return ref;
}

function readCurrentRef(): string | null {
  try {
    return fs.readFileSync(PROJECT_REF_FILE, 'utf-8').trim();
  } catch {
    return null;
  }
}

function linkProject(ref: string): void {
  execSync(`supabase link --project-ref ${ref}`, {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    env: { ...process.env, FORCE_COLOR: '0' },
  });
}

function dryRunMigrations(): string {
  return execSync('supabase db push --dry-run', {
    cwd: REPO_ROOT,
    encoding: 'utf-8',
    stdio: 'pipe',
    env: { ...process.env, FORCE_COLOR: '0' },
  });
}

function extractMigrationNames(output: string): string[] {
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^\d{14}_.+\.sql/.test(line) || line.includes('Applying migration'));
}

function main(): void {
  const env = resolveEnvArg();
  const targetRef = getProjectRef(env);
  const previousRef = readCurrentRef();

  try {
    console.log(`Linking to ${env} project: ${targetRef}`);
    linkProject(targetRef);

    console.log('\nRunning supabase db push --dry-run...\n');
    const output = dryRunMigrations();
    console.log(output);

    const migrations = extractMigrationNames(output);
    if (migrations.length > 0) {
      console.log(`\nMigrations that would be applied to ${env}:`);
      for (const migration of migrations) {
        console.log(`  - ${migration}`);
      }
    } else {
      console.log(`\nNo pending migrations for ${env}.`);
    }
  } finally {
    if (previousRef && previousRef !== targetRef) {
      console.log(`\nRestoring previous linked project: ${previousRef}`);
      try {
        linkProject(previousRef);
      } catch {
        console.error(`Warning: failed to restore linked project ${previousRef}`);
      }
    }
  }
}

main();
