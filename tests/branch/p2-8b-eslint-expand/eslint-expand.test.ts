import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, '../../../', relativePath), 'utf-8');
}

describe('P2.8b ESLint scope expansion', () => {
  it('lints all of src, not only src/domain', () => {
    const pkg = read('package.json');
    expect(pkg).toContain('"lint": "eslint src scripts"');
    expect(pkg).not.toContain('"lint": "eslint src/domain scripts"');
  });

  it('configures browser and node globals in eslint.config.js', () => {
    const config = read('eslint.config.js');
    expect(config).toContain('import globals from "globals"');
    expect(config).toContain('...globals.browser');
    expect(config).toContain('...globals.node');
    expect(config).toContain('files: ["src/**/*.{ts,tsx}"]');
  });

  it('adds a client hydration helper without setState-in-effect', () => {
    const hook = read('src/hooks/useIsClient.ts');
    expect(hook).toContain('useSyncExternalStore');
    expect(hook).not.toContain('useEffect');
  });
});