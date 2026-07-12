/**
 * Production Access Certification (DC-4.1)
 *
 * Verifies that the operator has sufficient Fly.io access to inspect the
 * production environment without deploying anything.
 *
 * Usage:
 *   tsx platform/scripts/deployment/verify-production-access.ts
 */

const PRODUCTION_APP = 'vintrack-prod';

interface CheckResult {
  name: string;
  ok: boolean;
  message: string;
}

async function runCommand(command: string[]): Promise<{ ok: boolean; output: string; error: string }> {
  const { spawn } = await import('node:child_process');
  return new Promise((resolve) => {
    const proc = spawn(command[0], command.slice(1), { stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    let error = '';
    proc.stdout.on('data', (data) => {
      output += data.toString();
    });
    proc.stderr.on('data', (data) => {
      error += data.toString();
    });
    proc.on('close', (code) => {
      resolve({ ok: code === 0, output, error });
    });
  });
}

async function main(): Promise<void> {
  const checks: CheckResult[] = [];

  const auth = await runCommand(['flyctl', 'auth', 'whoami']);
  checks.push({
    name: 'flyctl auth whoami',
    ok: auth.ok,
    message: auth.ok ? auth.output.trim() : auth.error.trim(),
  });

  const apps = await runCommand(['flyctl', 'apps', 'list']);
  checks.push({
    name: 'flyctl apps list',
    ok: apps.ok && apps.output.includes(PRODUCTION_APP),
    message: apps.ok
      ? apps.output.includes(PRODUCTION_APP)
        ? `${PRODUCTION_APP} found`
        : `${PRODUCTION_APP} not found in apps list`
      : apps.error.trim(),
  });

  const status = await runCommand(['flyctl', 'status', '-a', PRODUCTION_APP]);
  checks.push({
    name: `flyctl status -a ${PRODUCTION_APP}`,
    ok: status.ok,
    message: status.ok ? 'production status readable' : status.error.trim(),
  });

  const secrets = await runCommand(['flyctl', 'secrets', 'list', '-a', PRODUCTION_APP]);
  checks.push({
    name: `flyctl secrets list -a ${PRODUCTION_APP}`,
    ok: secrets.ok,
    message: secrets.ok ? 'production secrets readable' : secrets.error.trim(),
  });

  console.log('Production Access Certification (DC-4.1)');
  console.log('');
  let allOk = true;
  for (const check of checks) {
    const icon = check.ok ? '✓' : '✗';
    console.log(`${icon} ${check.name}: ${check.message}`);
    if (!check.ok) allOk = false;
  }

  if (!allOk) {
    console.log('');
    console.error('Production access certification failed.');
    process.exit(1);
  }

  console.log('');
  console.log('Production access certification passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
