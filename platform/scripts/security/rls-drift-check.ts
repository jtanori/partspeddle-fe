import fs from 'fs';
import path from 'path';

const SCHEMA_PATH = path.resolve(process.cwd(), 'supabase', 'SCHEMA.sql');
const MIGRATIONS_DIR = path.resolve(process.cwd(), 'supabase', 'migrations');

function extractPolicyDefinitions(sql: string): Map<string, string> {
  const policies = new Map<string, string>();
  const regex = /CREATE POLICY\s+"([^"]+)"\s+ON\s+"public"\."([^"]+)"[\s\S]*?;/gi;
  let match;
  while ((match = regex.exec(sql)) !== null) {
    const [, policyName, tableName] = match;
    policies.set(`${tableName}.${policyName}`, match[0].replace(/\s+/g, ' ').trim());
  }
  return policies;
}

function main(): { ok: boolean; diffs: string[] } {
  const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  const schemaPolicies = extractPolicyDefinitions(schemaSql);

  const migrationPolicies = new Map<string, string>();
  for (const file of fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql'))) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
    for (const [key, value] of extractPolicyDefinitions(sql)) {
      migrationPolicies.set(key, value);
    }
  }

  const diffs: string[] = [];
  for (const [key, schemaValue] of schemaPolicies.entries()) {
    const migrationValue = migrationPolicies.get(key);
    if (!migrationValue) {
      diffs.push(`Policy ${key} exists in SCHEMA.sql but not in migrations.`);
    } else if (schemaValue !== migrationValue) {
      diffs.push(`Policy ${key} differs between SCHEMA.sql and migrations.`);
    }
  }

  for (const key of migrationPolicies.keys()) {
    if (!schemaPolicies.has(key)) {
      diffs.push(`Policy ${key} exists in migrations but not in SCHEMA.sql.`);
    }
  }

  return { ok: diffs.length === 0, diffs };
}

const { ok, diffs } = main();
if (!ok) {
  console.error('RLS drift detected:');
  for (const diff of diffs) {
    console.error(`  - ${diff}`);
  }
  process.exit(1);
}
console.log('RLS policy drift check passed.');
