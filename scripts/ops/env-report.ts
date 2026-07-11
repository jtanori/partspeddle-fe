import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import {
  ENVIRONMENT_VARIABLES,
  EnvProvider,
  EnvScope,
  type EnvVarDefinition,
} from '../../config/environment/schema';
import * as classify from '../../config/environment/classify';

const OUTPUT_DIR = new URL('../../config/environment/generated', import.meta.url).pathname;

function badge(value: boolean, yes = 'Yes', no = 'No'): string {
  return value ? yes : no;
}

function row(def: EnvVarDefinition): string {
  const defaultCol = def.defaultValue !== undefined ? `\`${String(def.defaultValue)}\`` : '—';
  return `| \`${def.name}\` | ${def.description} | ${def.scope} | ${def.provider} | ${badge(def.required)} | ${badge(def.secret)} | ${defaultCol} |`;
}

function tableHeader(): string {
  return '| Variable | Description | Scope | Provider | Required | Secret | Default |\n| --- | --- | --- | --- | --- | --- | --- |';
}

function generateRequired(): string {
  const lines: string[] = [
    '# Required Environment Variables',
    '',
    'Auto-generated from `config/environment/schema.ts`.',
    '',
    '## Runtime',
    '',
    tableHeader(),
    ...classify
      .required()
      .filter((v) => v.scope === EnvScope.SERVER_RUNTIME || v.scope === EnvScope.PUBLIC_RUNTIME)
      .map(row),
    '',
    '## CI / Deploy',
    '',
    tableHeader(),
    ...classify
      .required()
      .filter((v) => v.scope === EnvScope.CI_DEPLOY)
      .map(row),
    '',
    '## Smoke Tests',
    '',
    tableHeader(),
    ...classify
      .required()
      .filter((v) => v.scope === EnvScope.SMOKE_TEST)
      .map(row),
    '',
  ];
  return lines.join('\n');
}

function generatePublic(): string {
  const lines: string[] = [
    '# Public / Browser Environment Variables',
    '',
    'Variables prefixed with `NEXT_PUBLIC_` are embedded in the client bundle. **Never place secrets here.**',
    '',
    tableHeader(),
    ...classify.publicRuntime().map(row),
    '',
  ];
  return lines.join('\n');
}

function generateSecrets(): string {
  const lines: string[] = [
    '# Secret Environment Variables',
    '',
    'These variables must be stored in encrypted secret storage (Fly secrets, GitHub environment secrets, or a local `.env.local` that is never committed).',
    '',
    tableHeader(),
    ...classify.secrets().map(row),
    '',
  ];
  return lines.join('\n');
}

function generateProviders(): string {
  const providers = Object.values(EnvProvider);
  const lines: string[] = [
    '# Environment Variables by Provider',
    '',
    'Auto-generated from `config/environment/schema.ts`.',
    '',
  ];

  for (const provider of providers) {
    const vars = classify.byProvider(provider);
    if (vars.length === 0) continue;
    lines.push(`## ${provider}`, '', tableHeader(), ...vars.map(row), '');
  }

  return lines.join('\n');
}

function generateDriftMatrix(): string {
  const runtimeScopes = [EnvScope.SERVER_RUNTIME, EnvScope.PUBLIC_RUNTIME];
  const runtimeVars = ENVIRONMENT_VARIABLES.filter((v) => runtimeScopes.includes(v.scope));

  const lines: string[] = [
    '# Environment Drift Matrix',
    '',
    'Runtime variables that must exist in every deployment environment (staging, production).',
    'This matrix is used for **DC-7.1 Environment Drift Certification**.',
    '',
    '| Variable | Staging | Production | Provider | Secret |',
    '| --- | --- | --- | --- | --- |',
    ...runtimeVars.map((v) => `| \`${v.name}\` | ✅ | ✅ | ${v.provider} | ${badge(v.secret)} |`),
    '',
    '> Values are not compared; only schema presence is verified.',
    '',
  ];
  return lines.join('\n');
}

function writeGenerated(fileName: string, content: string): void {
  const path = `${OUTPUT_DIR}/${fileName}`;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  console.log(`Generated ${path}`);
}

writeGenerated('required.md', generateRequired());
writeGenerated('public.md', generatePublic());
writeGenerated('secrets.md', generateSecrets());
writeGenerated('providers.md', generateProviders());
writeGenerated('drift-matrix.md', generateDriftMatrix());

console.log('Environment documentation generated successfully.');
