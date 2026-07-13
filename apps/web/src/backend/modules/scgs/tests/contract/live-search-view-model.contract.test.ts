import { describe, it, expect } from 'vitest';
import { liveSearchViewModelSchema } from '../../contract/live-search-view-model.contract';

describe('liveSearchViewModelSchema', () => {
  it('validates a minimal live search view model', () => {
    const model = {
      intent: {
        type: 'PART_NAME',
        raw: 'brake pads',
        entities: { partName: 'brake pads' },
      },
      groups: [
        {
          key: 'products',
          label: 'Products',
          suggestions: [
            {
              id: 'part-1',
              type: 'product',
              title: 'Brake Pads',
            },
          ],
        },
      ],
      meta: {
        query: 'brake pads',
        generatedAt: new Date().toISOString(),
      },
    };

    const result = liveSearchViewModelSchema.safeParse(model);
    expect(result.success).toBe(true);
  });

  it('rejects missing intent type', () => {
    const model = {
      intent: {
        type: 'UNKNOWN',
        raw: 'brake pads',
        entities: {},
      },
      groups: [],
      meta: { query: 'brake pads' },
    };

    const result = liveSearchViewModelSchema.safeParse(model);
    expect(result.success).toBe(false);
  });
});
