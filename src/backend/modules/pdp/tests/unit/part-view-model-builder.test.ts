import { describe, it, expect } from 'vitest';
import { PartViewModelBuilder } from '../application/part-view-model-builder';
import { Part } from '@/types';

describe('PartViewModelBuilder', () => {
  it('should correctly map raw part data to PartViewModel', () => {
    const rawPart: Part = {
      id: 'test-id',
      title: 'Test Part',
      condition: 'NEW',
      price: 100,
      sellerId: 'seller-1',
      // ... other fields needed to satisfy Part type
    } as any;

    const builder = new PartViewModelBuilder();
    const vm = builder.build(rawPart, null); // passing null seller for now

    expect(vm.id).toBe('test-id');
    expect(vm.pricing.partPrice).toBe(100);
    expect(vm.badges.isOEM).toBe(true); // Logic: NEW = OEM
  });
});
