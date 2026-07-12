import { describe, it, expect } from 'vitest';
import {
  SupabaseSellerRepository,
  createSellerRepository,
} from '../../application';

describe('Seller module contract', () => {
  it('exports the Supabase seller repository implementation', () => {
    expect(SupabaseSellerRepository).toBeDefined();
    const instance = new SupabaseSellerRepository({ from: () => ({}) as any });
    expect(instance.findTopSellers).toBeInstanceOf(Function);
  });

  it('exports a factory function', () => {
    expect(createSellerRepository).toBeInstanceOf(Function);
  });
});
