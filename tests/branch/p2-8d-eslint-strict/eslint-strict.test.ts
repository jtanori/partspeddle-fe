import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, '../../../', relativePath), 'utf-8');
}

describe('P2.8d ESLint strict domain rules', () => {
  it('enforces no-explicit-any and no-unused-vars as errors in src/domain', () => {
    const config = read('packages/config/eslint.config.js');
    expect(config).toContain('apps/web/src/domain/**/*.{ts,tsx}');
    expect(config).toContain('"@typescript-eslint/no-explicit-any": "error"');
    expect(config).toContain('"@typescript-eslint/no-unused-vars": "error"');
  });

  it('keeps relaxed any rules for the broader src tree', () => {
    const config = read('packages/config/eslint.config.js');
    expect(config).toContain('"@typescript-eslint/no-explicit-any": "off"');
    expect(config).toContain('"@typescript-eslint/no-unused-vars": "warn"');
  });

  it('removes any from domain diff and compiler types', () => {
    const types = read('apps/web/src/domain/specification/scgs/types.ts');
    const diffEngine = read('apps/web/src/domain/specification/scgs/diff.engine.ts');
    const compiler = read('apps/web/src/domain/services/specification.compiler.ts');

    expect(types).not.toMatch(/\bany\b/);
    expect(diffEngine).not.toMatch(/\bany\b/);
    expect(compiler).not.toMatch(/\bas any\b/);
    expect(compiler).toContain('listingQualityScore');
    expect(compiler).toContain('sellerTrustScore');
  });
});
