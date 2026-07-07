import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

interface Check {
  name: string;
  status: 'PASS' | 'FAIL';
  detail: string;
}

const checks: Check[] = [];

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function checkHealth(stagingUrl: string): Promise<void> {
  const url = new URL('/api/health', stagingUrl).toString();
  const response = await fetch(url);
  const text = await response.text();
  if (response.status !== 200) {
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
  checks.push({ name: 'Staging /api/health', status: 'PASS', detail: `HTTP 200 (${text})` });
}

async function checkSearchOutbox(supabaseUrl: string, serviceRoleKey: string): Promise<void> {
  execSync('pnpm exec tsx scripts/search/process-search-outbox.ts', {
    cwd: REPO_ROOT,
    env: {
      ...process.env,
      SUPABASE_URL: supabaseUrl,
      SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey,
    },
    stdio: 'pipe',
  });
  checks.push({
    name: 'Search outbox processing',
    status: 'PASS',
    detail: 'completed without errors',
  });
}

async function checkEdgeFunction(supabaseUrl: string): Promise<void> {
  const url = new URL('/functions/v1/send-message-notification', supabaseUrl).toString();
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const text = await response.text();
  // A deployed function should reject an unauthenticated request with 401.
  // Any 5xx means the function is not deployed or unhealthy.
  if (response.status >= 500) {
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
  checks.push({
    name: 'Edge Function smoke (send-message-notification)',
    status: 'PASS',
    detail: `HTTP ${response.status} (${text})`,
  });
}

function printReport(): void {
  console.log('\n=== Staging Smoke Test Report ===\n');
  for (const check of checks) {
    const icon = check.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${check.name}: ${check.status}`);
    console.log(`   ${check.detail}`);
  }
}

async function main(): Promise<void> {
  const stagingUrl = requireEnv('STAGING_URL');
  const supabaseUrl = requireEnv('STAGING_SUPABASE_URL');
  const serviceRoleKey = requireEnv('STAGING_SUPABASE_SERVICE_ROLE_KEY');
  requireEnv('STAGING_SUPABASE_ANON_KEY');

  const failures: string[] = [];

  for (const [name, fn] of [
    ['health check', () => checkHealth(stagingUrl)],
    ['search outbox', () => checkSearchOutbox(supabaseUrl, serviceRoleKey)],
    ['edge function', () => checkEdgeFunction(supabaseUrl)],
  ] as [string, () => Promise<void>][]) {
    try {
      await fn();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push(name);
      checks.push({ name, status: 'FAIL', detail: message });
    }
  }

  printReport();

  if (failures.length > 0) {
    console.error(`\n❌ Smoke test failed: ${failures.join(', ')}`);
    process.exit(1);
  }

  console.log('\n✅ All staging smoke checks passed.');
}

main();
