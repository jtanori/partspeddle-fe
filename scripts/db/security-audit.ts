/**
 * Static database security audit.
 *
 * Reads the rebaseline schema/migrations and Edge Function sources, then writes
 * a JSON checklist (`reports/db-security-audit.json`) and a Markdown report
 * (`reports/db-security-audit.md`).
 *
 * The script does not connect to a running database; it is safe to run in CI.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');
const reportsDir = path.join(repoRoot, 'reports');

interface Finding {
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  remediation?: string;
}

interface ChecklistItem {
  id: string;
  description: string;
  result: 'pass' | 'fail' | 'gap';
  findings: Finding[];
}

function readFile(...segments: string[]): string {
  return fs.readFileSync(path.join(repoRoot, ...segments), 'utf-8');
}

function readDirSql(...segments: string[]): string {
  const dir = path.join(repoRoot, ...segments);
  if (!fs.existsSync(dir)) return '';
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((f) => readFile(...segments, f))
    .join('\n');
}

function combinedSchemaSql(): string {
  return [readFile('supabase', 'SCHEMA.sql'), readDirSql('supabase', 'migrations')].join('\n');
}

function extractPublicFunctionDefinitions(sql: string): Array<{
  name: string;
  securityDefiner: boolean;
  searchPath: string | null;
}> {
  // Match from CREATE OR REPLACE FUNCTION "public"."name" ... AS $$
  const regex =
    /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+"public"\."([^"]+)"\s*\([^)]*\)\s*RETURNS\s+\S+[\s\S]*?AS\s+\$\$/gi;
  const out = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(sql)) !== null) {
    const block = match[0];
    const name = match[1];
    const securityDefiner = /SECURITY\s+DEFINER/i.test(block);
    const searchPathMatch = block.match(/SET\s+"?search_path"?\s+TO\s+([^\n]+)/i);
    out.push({
      name,
      securityDefiner,
      searchPath: searchPathMatch ? searchPathMatch[1].trim() : null,
    });
  }
  return out;
}

function auditSecurityDefiners(sql: string): Finding[] {
  const functions = extractPublicFunctionDefinitions(sql);
  return functions
    .filter((f) => f.securityDefiner && !f.searchPath)
    .map((f) => ({
      category: 'SECURITY DEFINER search_path',
      severity: 'high' as const,
      message: `Function "public"."${f.name}" is SECURITY DEFINER but does not SET search_path.`,
      remediation: `Add SET search_path = public, pg_temp to the function definition.`,
    }));
}

function auditUserRolesTable(sql: string): Finding[] {
  const hasTable = /CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+public\.user_roles\b/i.test(sql);
  const findings: Finding[] = [];
  if (!hasTable) {
    findings.push({
      category: 'Missing table',
      severity: 'critical' as const,
      message:
        'public.user_roles is referenced by handle_new_user_role but no CREATE TABLE exists in schema/migrations.',
      remediation: 'Add CREATE TABLE public.user_roles to the role-sync migration.',
    });
  }
  return findings;
}

function auditRoleEscalation(sql: string): Finding[] {
  const findings: Finding[] = [];
  if (/NEW\.raw_user_meta_data\s*->>\s*['"]role['"]/i.test(sql)) {
    findings.push({
      category: 'Role escalation',
      severity: 'critical' as const,
      message: 'handle_new_user_role derives role from client-controllable raw_user_meta_data.',
      remediation: 'Always assign "buyer" on sign-up; elevate roles only through an admin process.',
    });
  }
  return findings;
}

function auditLegacyWebhookTriggers(sql: string): Finding[] {
  const findings: Finding[] = [];
  if (/CREATE\s+OR\s+REPLACE\s+TRIGGER\s+["']?sync-algolia-webhook["']?\s+AFTER/i.test(sql)) {
    findings.push({
      category: 'Legacy synchronous webhook',
      severity: 'critical' as const,
      message:
        'Legacy "sync-algolia-webhook" database trigger invokes the Edge Function with a hard-coded Authorization header.',
      remediation: 'Drop the trigger and rely on the search_outbox worker; rotate any exposed JWT.',
    });
  }
  if (/CREATE\s+OR\s+REPLACE\s+TRIGGER\s+["']?notify-new-message["']?\s+AFTER/i.test(sql)) {
    findings.push({
      category: 'Legacy synchronous webhook',
      severity: 'critical' as const,
      message:
        'Legacy "notify-new-message" database trigger invokes the Edge Function with a hard-coded Authorization header.',
      remediation:
        'Drop the trigger and invoke send-message-notification explicitly from application code; rotate any exposed JWT.',
    });
  }
  return findings;
}

function auditExtensions(sql: string): Finding[] {
  const extensions = new Set<string>();
  const regex = /CREATE\s+EXTENSION\s+IF\s+NOT\s+EXISTS\s+"([^"]+)"/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(sql)) !== null) {
    extensions.add(match[1]);
  }

  const findings: Finding[] = [];
  const potentiallyUnused = ['pg_net', 'pg_graphql', 'supabase_vault', 'uuid-ossp'];
  for (const ext of potentiallyUnused) {
    if (extensions.has(ext)) {
      findings.push({
        category: 'Extension surface',
        severity: 'low' as const,
        message: `Extension "${ext}" is installed. Verify it is required for the marketplace.`,
        remediation: `Drop ${ext} if it is not actively used.`,
      });
    }
  }
  return findings;
}

function auditRlsCoverage(sql: string): Finding[] {
  const rlsRegex = /ALTER\s+TABLE\s+"public"\."([^"]+)"\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/gi;
  const policyRegex = /CREATE\s+POLICY\s+"[^"]+"\s+ON\s+"public"\."([^"]+)"/gi;
  const tables = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = rlsRegex.exec(sql)) !== null) tables.add(m[1]);
  const tablesWithPolicies = new Set<string>();
  while ((m = policyRegex.exec(sql)) !== null) tablesWithPolicies.add(m[1]);

  const findings: Finding[] = [];
  for (const table of tables) {
    if (!tablesWithPolicies.has(table)) {
      findings.push({
        category: 'RLS policy gap',
        severity: 'medium' as const,
        message: `Table "public"."${table}" has RLS enabled but no policies defined in the audited files.`,
        remediation:
          'Add explicit SELECT/INSERT/UPDATE/DELETE policies or document the service-role-only access model.',
      });
    }
  }
  return findings;
}

function readFunctionSource(name: string): string {
  return readFile('supabase', 'functions', name, 'index.ts');
}

function auditEdgeFunctions(): Finding[] {
  const findings: Finding[] = [];

  // sync-algolia-webhook: must verify x-webhook-signature
  const syncWebhook = readFunctionSource('sync-algolia-webhook');
  if (!/x-webhook-signature/i.test(syncWebhook) || !/verifyWebhookSignature/i.test(syncWebhook)) {
    findings.push({
      category: 'Edge Function auth',
      severity: 'critical' as const,
      message: 'sync-algolia-webhook does not verify a webhook signature.',
      remediation:
        'Verify x-webhook-signature HMAC against SUPABASE_WEBHOOK_SECRET before processing.',
    });
  }

  // analyze-part-image: must verify caller JWT
  const analyzeImage = readFunctionSource('analyze-part-image');
  if (!/verifyUserJwt/i.test(analyzeImage) || !/authorization/i.test(analyzeImage)) {
    findings.push({
      category: 'Edge Function auth',
      severity: 'critical' as const,
      message: 'analyze-part-image has no caller authentication.',
      remediation: 'Require a valid Bearer JWT (SUPABASE_ANON_KEY) and reject anonymous requests.',
    });
  }

  // send-message-notification: must verify caller JWT
  const sendNotification = readFunctionSource('send-message-notification');
  if (!/verifyUserJwt/i.test(sendNotification) || !/authorization/i.test(sendNotification)) {
    findings.push({
      category: 'Edge Function auth',
      severity: 'critical' as const,
      message: 'send-message-notification does not verify the caller JWT.',
      remediation: 'Require a valid Bearer JWT and confirm conversation participation.',
    });
  }

  return findings;
}

function auditServiceRoleUsage(): Finding[] {
  const apiDir = path.join(repoRoot, 'src', 'app', 'api');
  const findings: Finding[] = [];
  if (fs.existsSync(apiDir)) {
    const walk = (dir: string): string[] => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const files: string[] = [];
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) files.push(...walk(full));
        else if (entry.isFile() && full.endsWith('.ts')) files.push(full);
      }
      return files;
    };
    for (const file of walk(apiDir)) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('supabaseAdmin')) {
        const relative = path.relative(repoRoot, file);
        findings.push({
          category: 'Service-role usage',
          severity: 'medium' as const,
          message: `${relative} imports supabaseAdmin and bypasses RLS.`,
          remediation:
            'Use the anon/SSR client where possible; reserve service role for background jobs or admin routes.',
        });
      }
    }
  }
  return findings;
}

function buildChecklist(findings: Finding[]): ChecklistItem[] {
  const byCategory = (category: string) => findings.filter((f) => f.category === category);

  return [
    {
      id: 'SD-1',
      description: 'All SECURITY DEFINER functions set search_path = public, pg_temp',
      result: byCategory('SECURITY DEFINER search_path').length === 0 ? 'pass' : 'fail',
      findings: byCategory('SECURITY DEFINER search_path'),
    },
    {
      id: 'TBL-1',
      description: 'public.user_roles table is defined in schema/migrations',
      result: byCategory('Missing table').length === 0 ? 'pass' : 'fail',
      findings: byCategory('Missing table'),
    },
    {
      id: 'AUTH-1',
      description: 'New sign-ups cannot self-escalate roles via raw_user_meta_data',
      result: byCategory('Role escalation').length === 0 ? 'pass' : 'fail',
      findings: byCategory('Role escalation'),
    },
    {
      id: 'WEBHOOK-1',
      description: 'Legacy synchronous webhook triggers with hard-coded JWTs are removed',
      result: byCategory('Legacy synchronous webhook').length === 0 ? 'pass' : 'fail',
      findings: byCategory('Legacy synchronous webhook'),
    },
    {
      id: 'EF-1',
      description: 'Edge Functions enforce authentication before acting',
      result: byCategory('Edge Function auth').length === 0 ? 'pass' : 'fail',
      findings: byCategory('Edge Function auth'),
    },
    {
      id: 'RLS-1',
      description:
        'Every RLS-enabled table has at least one explicit policy (or documented service-role-only access)',
      result: byCategory('RLS policy gap').length === 0 ? 'pass' : 'gap',
      findings: byCategory('RLS policy gap'),
    },
    {
      id: 'EXT-1',
      description: 'Only required Postgres extensions are installed',
      result: byCategory('Extension surface').length === 0 ? 'pass' : 'gap',
      findings: byCategory('Extension surface'),
    },
    {
      id: 'SR-1',
      description: 'Service-role client is only used where RLS bypass is justified',
      result: byCategory('Service-role usage').length === 0 ? 'pass' : 'gap',
      findings: byCategory('Service-role usage'),
    },
  ];
}

function main(): void {
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const sql = combinedSchemaSql();
  const findings: Finding[] = [
    ...auditSecurityDefiners(sql),
    ...auditUserRolesTable(sql),
    ...auditRoleEscalation(sql),
    ...auditLegacyWebhookTriggers(sql),
    ...auditExtensions(sql),
    ...auditRlsCoverage(sql),
    ...auditEdgeFunctions(),
    ...auditServiceRoleUsage(),
  ];

  const checklist = buildChecklist(findings);
  const critical = findings.filter((f) => f.severity === 'critical').length;
  const high = findings.filter((f) => f.severity === 'high').length;
  const medium = findings.filter((f) => f.severity === 'medium').length;
  const low = findings.filter((f) => f.severity === 'low').length;

  const jsonReport = {
    generatedAt: new Date().toISOString(),
    summary: { critical, high, medium, low, total: findings.length },
    checklist,
    findings,
  };

  fs.writeFileSync(
    path.join(reportsDir, 'db-security-audit.json'),
    JSON.stringify(jsonReport, null, 2),
  );

  const mdLines = [
    '# Database Security Audit Report',
    '',
    `Generated: ${jsonReport.generatedAt}`,
    '',
    '## Summary',
    '',
    `- Critical: ${critical}`,
    `- High: ${high}`,
    `- Medium: ${medium}`,
    `- Low: ${low}`,
    `- Total findings: ${findings.length}`,
    '',
    '## PRC Section 11 Checklist',
    '',
    '| ID | Check | Result |',
    '|----|-------|--------|',
    ...checklist.map((c) => `| ${c.id} | ${c.description} | ${c.result.toUpperCase()} |`),
    '',
    '## Findings',
    '',
    ...findings.flatMap((f) => [
      `### ${f.category} — ${f.severity.toUpperCase()}`,
      '',
      f.message,
      '',
      f.remediation ? `**Remediation:** ${f.remediation}` : '',
      '',
    ]),
  ];

  fs.writeFileSync(path.join(reportsDir, 'db-security-audit.md'), mdLines.join('\n'));

  console.log(`Audit complete: ${findings.length} findings (${critical} critical, ${high} high).`);
  console.log(`Reports written to reports/db-security-audit.{json,md}`);
  if (critical > 0) {
    console.error('Critical findings remain.');
    process.exit(1);
  }
}

main();
