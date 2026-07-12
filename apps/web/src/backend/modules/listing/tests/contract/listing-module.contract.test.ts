import { describe, it, expect } from 'vitest';
import {
  SupabaseListingRepository,
  createListingRepository,
} from '../../application';

describe('Listing module contract', () => {
  it('exports the Supabase listing repository implementation', () => {
    expect(SupabaseListingRepository).toBeDefined();
    const instance = new SupabaseListingRepository({ from: () => ({}) as any });
    expect(instance.findById).toBeInstanceOf(Function);
    expect(instance.findFeatured).toBeInstanceOf(Function);
  });

  it('exports a factory function', () => {
    expect(createListingRepository).toBeInstanceOf(Function);
  });
});
