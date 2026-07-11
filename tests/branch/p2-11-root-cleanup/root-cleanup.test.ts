import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../../../');

function exists(relativePath: string): boolean {
  return fs.existsSync(path.join(root, relativePath));
}

function read(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), 'utf-8');
}

describe('P2.11 project root and scripts cleanup', () => {
  it('removes legacy root clutter files', () => {
    expect(exists('vite.config.ts')).toBe(false);
    expect(exists('metadata.json')).toBe(false);
    expect(exists('search-load-test.js')).toBe(false);
    expect(exists('all_src_files.txt')).toBe(false);
    expect(exists('lib/utils.ts')).toBe(false);
    expect(exists('customFormatter.js')).toBe(false);
  });

  it('relocates dev tooling under scripts/tools and docs/notes', () => {
    expect(exists('scripts/tools/eslint-formatter.js')).toBe(true);
    expect(exists('docs/notes/GEMINI.md')).toBe(true);
  });

  it('points package.json scripts at reorganized script paths', () => {
    const pkg = read('package.json');
    expect(pkg).toContain('"db:verify": "tsx scripts/db/verify-db.ts"');
    expect(pkg).toContain('"search:process-outbox": "tsx scripts/search/process-search-outbox.ts"');
    expect(pkg).toContain('scripts/search/audit-search-consistency.ts');
    expect(pkg).not.toContain('scripts/audit-search-consistency.ts');
    expect(pkg).not.toContain('db:seed:listings');
  });

  it('keeps deploy helper under scripts/ops', () => {
    expect(exists('scripts/ops/deploy.sh')).toBe(true);
    expect(exists('scripts/deploy.sh')).toBe(false);
  });
});