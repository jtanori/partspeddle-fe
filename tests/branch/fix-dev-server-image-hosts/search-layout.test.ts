import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, '../../../', relativePath), 'utf-8');
}

describe('search page layout markup', () => {
  it('uses a single Content container for sidebar and results', () => {
    const searchPage = read('src/components/search/SearchPageClient.tsx');
    expect(searchPage).toContain('<Content');
    expect(searchPage).toContain('aria-label="Search filters"');
    expect(searchPage).toContain('aria-label="Search results"');
    expect(searchPage).not.toContain('<main');
    expect(searchPage).not.toContain('container mx-auto');
  });

  it('avoids nesting another main inside the public route group layout', () => {
    const publicLayout = read('src/app/(public)/layout.tsx');
    expect(publicLayout).not.toContain('<main');
  });

  it('matches the loading skeleton to the search page container structure', () => {
    const loading = read('src/app/(public)/search/loading.tsx');
    expect(loading).toContain('max-w-7xl');
    expect(loading).not.toContain('<main');
    expect(loading).not.toContain('container mx-auto');
    expect(loading).toContain('Skeleton');
  });

  it('uses Skeleton placeholders for client-side search fetches', () => {
    const searchPage = read('src/components/search/SearchPageClient.tsx');
    const controller = read('src/components/search/SearchResultsController.tsx');
    expect(searchPage).toContain('Skeleton');
    expect(searchPage).not.toContain('Searching...');
    expect(controller).not.toContain('Buscando partes');
    expect(controller).toContain('return null');
  });
});
