import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, '../../../', relativePath), 'utf-8');
}

describe('P2.8a build and typecheck gate', () => {
  it('adds a typecheck script to package.json', () => {
    const pkg = read('package.json');
    expect(pkg).toContain('"typecheck": "tsc --noEmit"');
  });

  it('exports a stable search hit mapper alias', () => {
    const mapper = read('src/lib/search-hit-mapper.ts');
    expect(mapper).toContain('mapAlgoliaHitToPart');
    expect(mapper).toContain('mapSearchHitToPart');
  });

  it('maps UI search filters to repository filters in server search', () => {
    const serverSearch = read('src/lib/search/server-search.ts');
    expect(serverSearch).toContain('SearchFilters as UiSearchFilters');
    expect(serverSearch).toContain('SearchFilters as RepositorySearchFilters');
    expect(serverSearch).toContain('mapAlgoliaHitToPart');
  });

  it('types search results controller filters with SearchFilters', () => {
    const controller = read('src/components/search/SearchResultsController.tsx');
    expect(controller).toContain('filters: SearchFilters');
    expect(controller).not.toContain('filters: Record<string, unknown>');
  });
});