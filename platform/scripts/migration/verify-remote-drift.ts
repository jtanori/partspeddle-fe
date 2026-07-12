/**
 * Remote drift check for migration-driven deployments.
 *
 * Compares the linked remote Supabase project against the local migration
 * stack using `supabase db diff --linked`. If the remote schema is already
 * in sync, the diff is empty and the script exits 0. Any non-empty diff
 * means drift and the script exits 1.
 *
 * Requirements:
 * - `supabase` CLI is installed and authenticated.
 * - The project is linked (`supabase link --project-ref <ref>`).
 * - `SUPABASE_ACCESS_TOKEN` is available when running in CI.
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

function isMeaningfulDiff(raw: string): boolean {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .some((line) => line.length > 0 && !line.startsWith('--'));
}

function main(): void {
  console.log('Checking linked remote schema against local migrations...');

  let rawDiff: string;
  try {
    rawDiff = execSync('supabase db diff --linked --schema public', {
      encoding: 'utf-8',
      cwd: REPO_ROOT,
      stdio: 'pipe',
      env: { ...process.env, FORCE_COLOR: '0' },
    });
  } catch (error) {
    const execError = error as { stdout?: string; stderr?: string; message?: string };
    console.error('Failed to run supabase db diff:', execError.stderr ?? execError.message ?? String(error));
    process.exit(2);
  }

  if (!isMeaningfulDiff(rawDiff)) {
    console.log('✅ No remote drift detected. Remote schema matches local migration target.');
    process.exit(0);
  }

  console.error('❌ Remote drift detected. Remote schema does not match local migration target.');
  console.error(rawDiff);

  const reportPath = path.join(REPO_ROOT, 'governance', 'certification', 'reports', 'remote-drift-report.md');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(
    reportPath,
    `# Remote Drift Report\n\nGenerated: ${new Date().toISOString()}\n\n\`\`\`sql\n${rawDiff}\n\`\`\`\n`,
    'utf-8',
  );
  console.error(`Drift report written to ${reportPath}`);
  process.exit(1);
}

main();
