import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

function runSeedScript(scriptPath: string, args: string[] = []) {
  const command = `pnpm exec tsx ${scriptPath}${args.length > 0 ? ' ' + args.join(' ') : ''}`;
  console.log(`\n▶️ ${command}`);
  execSync(command, {
    cwd: REPO_ROOT,
    stdio: 'inherit',
  });
}

async function seedStaging() {
  console.log('🌱 Running full staging seed pipeline...');

  runSeedScript('scripts/seed/seed-vehicles.ts');
  runSeedScript('scripts/seed/seed-part-types.ts');
  runSeedScript('scripts/seed/seed-users.ts');
  runSeedScript('scripts/seed/seed-catalog-rollout.ts');
  runSeedScript('scripts/seed/seed-production.ts', ['30']);

  console.log('\n✅ Staging seed pipeline complete.');
}

seedStaging().catch((err) => {
  console.error('💥 Staging seed pipeline failed:', err);
  process.exit(1);
});
