import fs from 'fs';
import path from 'path';

const NEXT_OUTPUT_DIR = path.resolve(process.cwd(), '.next');

const FORBIDDEN_SUBSTRINGS = ['SUPABASE_SERVICE_ROLE_KEY', 'ALGOLIA_ADMIN_KEY', 'GEMINI_API_KEY'];

function* walk(dir: string): Generator<string> {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else if (entry.isFile() && /\.(js|json|html|txt)$/.test(entry.name)) {
      yield fullPath;
    }
  }
}

function auditBundle(): { ok: boolean; matches: string[] } {
  const matches: string[] = [];
  for (const filePath of walk(path.join(NEXT_OUTPUT_DIR, 'static'))) {
    const content = fs.readFileSync(filePath, 'utf-8');
    for (const substring of FORBIDDEN_SUBSTRINGS) {
      if (content.includes(substring)) {
        matches.push(`${path.relative(process.cwd(), filePath)} contains ${substring}`);
      }
    }
  }
  return { ok: matches.length === 0, matches };
}

const { ok, matches } = auditBundle();
if (!ok) {
  console.error('Client bundle audit failed:');
  for (const match of matches) {
    console.error(`  - ${match}`);
  }
  process.exit(1);
}
console.log('Client bundle audit passed.');
