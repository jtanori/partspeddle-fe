import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, '../../../', relativePath), 'utf-8');
}

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.resolve(__dirname, '../../../', relativePath));
}

describe('P2.2 server-side search fetch', () => {
  it('fetches initial search results in the server search page', () => {
    const page = read('apps/web/src/app/(public)/search/page.tsx');
    expect(page).not.toContain("'use client'");
    expect(page).toContain('fetchSearchResults');
    expect(page).toContain('SearchPageClient');
    expect(page).toContain('Suspense');
  });

  it('adds a dedicated loading skeleton for search transitions', () => {
    expect(fileExists('apps/web/src/app/(public)/search/loading.tsx')).toBe(true);
    const loading = read('apps/web/src/app/(public)/search/loading.tsx');
    expect(loading).toContain('Skeleton');
  });

  it('hydrates the client search page with server-provided initial data', () => {
    const client = read('apps/web/src/components/search/SearchPageClient.tsx');
    expect(client).toContain('initialData');
    expect(client).toContain('requestKey');
    expect(client).toContain('skipInitialFetch');
  });

  it('parses URL search params into a stable request key', () => {
    const parser = read('apps/web/src/lib/search/parse-search-params.ts');
    expect(parser).toContain('parseSearchParams');
    expect(parser).toContain('serializeSearchRequest');
    expect(parser).toContain('partType');
  });

  it('keeps subsequent filter changes on the client search API path', () => {
    const controller = read('apps/web/src/components/search/SearchResultsController.tsx');
    expect(controller).toContain('/api/search/parts');
    expect(controller).toContain('AbortController');
    expect(controller).toContain('skipInitialFetch');
  });
});
