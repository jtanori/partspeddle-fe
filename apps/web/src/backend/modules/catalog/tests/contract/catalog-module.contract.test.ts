import { describe, it, expect } from 'vitest';
import {
  SupabaseCatalogRepository,
  createCatalogRepository,
} from '../../application';

describe('Catalog module contract', () => {
  it('exports the Supabase catalog repository implementation', () => {
    expect(SupabaseCatalogRepository).toBeDefined();
    const instance = new SupabaseCatalogRepository({ from: () => ({}) as any });
    expect(instance.getCategory).toBeInstanceOf(Function);
    expect(instance.getTaxonomy).toBeInstanceOf(Function);
  });

  it('exports a factory function', () => {
    expect(createCatalogRepository).toBeInstanceOf(Function);
  });
});
