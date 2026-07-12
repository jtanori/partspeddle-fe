import { describe, it, expect } from 'vitest';
import {
  mapCategoryTemplate,
  mapSpecificationValues,
} from '../../infrastructure/specification-framework-mapper';
import { SpecificationDefinition as CatalogDefinition } from '@/domain/types/catalog.types';

describe('SCGS specification framework mapper integration', () => {
  it('orders groups by display order', () => {
    const definitions: CatalogDefinition[] = [
      { ...createDef('def-1', 'voltage', 'number'), unit: 'V' },
      { ...createDef('def-2', 'material', 'text') },
    ];

    const groups = mapCategoryTemplate('cat-1', definitions, [
      {
        category_id: 'cat-1',
        spec_definition_id: 'def-2',
        required: false,
        display_order: 1,
        group_name: 'Physical',
      },
      {
        category_id: 'cat-1',
        spec_definition_id: 'def-1',
        required: true,
        display_order: 0,
        group_name: 'Electrical',
      },
    ]).groups;

    expect(groups[0].name).toBe('Electrical');
    expect(groups[1].name).toBe('Physical');
  });

  it('normalizes enum and boolean values', () => {
    const definitions: CatalogDefinition[] = [
      { ...createDef('def-1', 'warranty', 'boolean') },
      { ...createDef('def-2', 'condition', 'enum') },
    ];

    const values = mapSpecificationValues(definitions, [
      { key: 'warranty', label: 'Warranty', value: 'yes' },
      { key: 'condition', label: 'Condition', value: 'used' },
    ]);

    expect(values[0].resolvedValue).toBe(true);
    expect(values[1].resolvedValue).toBe('used');
  });

  it('falls back to General for specs without a group', () => {
    const definitions: CatalogDefinition[] = [createDef('def-1', 'notes', 'text')];

    const groups = mapCategoryTemplate('cat-1', definitions, [
      { category_id: 'cat-1', spec_definition_id: 'def-1', required: false, display_order: 0 },
    ]).groups;

    expect(groups[0].name).toBe('General');
  });
});

function createDef(
  id: string,
  key: string,
  dataType: CatalogDefinition['data_type'],
): CatalogDefinition {
  return {
    id,
    key,
    label: key,
    data_type: dataType,
    searchable: true,
    filterable: false,
    facetable: false,
    is_active: true,
    validation_rules: {},
  };
}
