import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');
const TEMP_DIR = path.join(REPO_ROOT, 'supabase', '.temp');

const LOCAL_DUMP = path.join(TEMP_DIR, 'local_public_schema.sql');
const REMOTE_DUMP = path.join(TEMP_DIR, 'remote_public_schema.sql');
const LOCAL_NORMALIZED = path.join(TEMP_DIR, 'local_public_schema.normalized.sql');
const REMOTE_NORMALIZED = path.join(TEMP_DIR, 'remote_public_schema.normalized.sql');

// Known intentional deviations between local replay and remote source of truth.
const ALLOWLIST_PATTERNS = [/notify-new-message/, /sync-algolia-webhook/];

function ensureLocalStack(): void {
  try {
    const status = execSync('supabase status', {
      encoding: 'utf-8',
      stdio: 'pipe',
      cwd: REPO_ROOT,
    });
    if (!status.includes('supabase local development setup is running')) {
      throw new Error('Local Supabase stack is not running.');
    }
  } catch (error) {
    console.error('Local Supabase stack is not running. Start it with: pnpm db:local:up');
    process.exit(1);
  }
}

function dumpSchema(source: 'local' | 'linked', output: string): void {
  const flag = source === 'local' ? '--local' : '--linked';
  console.log(`Dumping ${source} public schema to ${output}...`);
  execSync(`supabase db dump ${flag} --yes --schema public -f "${output}"`, {
    encoding: 'utf-8',
    stdio: 'inherit',
    cwd: REPO_ROOT,
  });
}

function normalizeDump(filePath: string): string[] {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => {
      if (line.length === 0) return false;
      if (line.startsWith('--')) return false;
      if (/OWNER TO/i.test(line)) return false;
      return true;
    })
    .filter((line) => !ALLOWLIST_PATTERNS.some((pattern) => pattern.test(line)));
}

function writeNormalized(lines: string[], outputPath: string): void {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, lines.join('\n') + '\n', 'utf-8');
}

function runDiff(left: string, right: string): string {
  try {
    return execSync(`diff -u "${left}" "${right}"`, {
      encoding: 'utf-8',
      stdio: 'pipe',
      cwd: REPO_ROOT,
    });
  } catch (error) {
    // diff exits 1 when files differ, but still prints the diff to stdout.
    const execError = error as { stdout?: string; stderr?: string };
    return execError.stdout ?? '';
  }
}

function main(): void {
  ensureLocalStack();
  fs.mkdirSync(TEMP_DIR, { recursive: true });

  dumpSchema('local', LOCAL_DUMP);
  dumpSchema('linked', REMOTE_DUMP);

  const localLines = normalizeDump(LOCAL_DUMP);
  const remoteLines = normalizeDump(REMOTE_DUMP);

  writeNormalized(localLines, LOCAL_NORMALIZED);
  writeNormalized(remoteLines, REMOTE_NORMALIZED);

  const diff = runDiff(LOCAL_NORMALIZED, REMOTE_NORMALIZED);

  if (!diff.trim()) {
    console.log(
      '\n✅ Local public schema matches remote public schema (allowlisted deviations ignored).',
    );
    process.exit(0);
  }

  console.error('\n❌ Local public schema does not match remote public schema.');
  console.error('Unexpected differences:\n');
  console.error(diff);
  process.exit(1);
}

main();
