import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, '../../../', relativePath), 'utf-8');
}

describe('P2.8c TypeScript strict mode', () => {
  it('enables strict mode in tsconfig.base.json', () => {
    const tsconfig = read('packages/config/tsconfig.base.json');
    expect(tsconfig).toContain('"strict": true');
    expect(tsconfig).not.toContain('"strict": false');
  });

  it('types Supabase auth callbacks in AuthProvider', () => {
    const authProvider = read('src/components/providers/AuthProvider.tsx');
    expect(authProvider).toContain('AuthChangeEvent');
    expect(authProvider).toContain('Session');
  });

  it('guards Gemini identify responses before JSON parsing', () => {
    const route = read('src/app/api/gemini/identify/route.ts');
    expect(route).toContain('result.text');
    expect(route).toContain('if (!responseText)');
  });

  it('aligns mobile filter setter typing with SearchPageClient', () => {
    const searchPage = read('src/components/search/SearchPageClient.tsx');
    expect(searchPage).toContain('SearchFilters | ((prev: SearchFilters) => SearchFilters)');
  });
});
