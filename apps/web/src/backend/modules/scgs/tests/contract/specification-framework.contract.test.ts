import { describe, it, expect } from 'vitest';
import {
  mapSpecificationDefinition,
  mapSpecificationGroups,
  mapCategoryTemplate,
  mapSpecificationValues,
} from '../../infrastructure/specification-framework-mapper';
import { SpecificationDefinition as CatalogDefinition } from '@/domain/types/catalog.types';

const baseDefinition: CatalogDefinition = {
  id: 'def-1',
  key: 'voltage',
  label: 'Voltage',
  data_type: 'number',
  unit: 'V',
  searchable: true,
  filterable: false,
  facetable: false,
  is_active: true,
  validation_rules: { min: 0, max: 24 },
};

describe('SCGS SpecificationFramework contract', () => {
  it('maps a catalog definition to a canonical SCGS definition', () => {
    const def = mapSpecificationDefinition(baseDefinition);

    expect(def.id).toBe('def-1');
    expect(def.key).toBe('voltage');
    expect(def.label).toBe('Voltage');
    expect(def.type).toBe('number');
    expect(def.unit).toBe('V');
    expect(def.searchable).toBe(true);
    expect(def.facetable).toBe(false);
    expect(def.validation.min).toBe(0);
    expect(def.validation.max).toBe(24);
  });

  it('groups category specifications by group name', () => {
    const definitions: CatalogDefinition[] = [
      { ...baseDefinition, id: 'def-1', key: 'voltage' },
      { ...baseDefinition, id: 'def-2', key: 'amperage', label: 'Amperage', data_type: 'number' },
    ];

    const groups = mapSpecificationGroups(definitions, [
      {
        category_id: 'cat-1',
        spec_definition_id: 'def-1',
        required: true,
        display_order: 0,
        group_name: 'Electrical',
      },
      {
        category_id: 'cat-1',
        spec_definition_id: 'def-2',
        required: false,
        display_order: 1,
        group_name: 'Electrical',
      },
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].name).toBe('Electrical');
    expect(groups[0].definitions).toHaveLength(2);
  });

  it('builds a category template with inherited definitions', () => {
    const definitions: CatalogDefinition[] = [
      { ...baseDefinition, id: 'def-1', key: 'voltage' },
      { ...baseDefinition, id: 'def-2', key: 'condition', label: 'Condition', data_type: 'text' },
    ];

    const template = mapCategoryTemplate('cat-1', definitions, [
      {
        category_id: 'cat-1',
        spec_definition_id: 'def-1',
        required: true,
        display_order: 0,
        group_name: 'Electrical',
      },
    ]);

    expect(template.categoryId).toBe('cat-1');
    expect(template.groups).toHaveLength(1);
    expect(template.inheritedDefinitions).toHaveLength(1);
    expect(template.inheritedDefinitions[0].key).toBe('condition');
  });

  it('coerces listing specification values by type', () => {
    const definitions: CatalogDefinition[] = [
      { ...baseDefinition, id: 'def-1', key: 'voltage', data_type: 'number' },
      { ...baseDefinition, id: 'def-2', key: 'oem', label: 'OEM', data_type: 'boolean' },
    ];

    const values = mapSpecificationValues(definitions, [
      { key: 'voltage', label: 'Voltage', value: '14.5' },
      { key: 'oem', label: 'OEM', value: 'true' },
    ]);

    expect(values).toHaveLength(2);
    expect(values[0].resolvedValue).toBe(14.5);
    expect(values[1].resolvedValue).toBe(true);
  });

  it('ignores listing specs without a matching definition', () => {
    const values = mapSpecificationValues([], [{ key: 'unknown', label: 'Unknown', value: 'x' }]);

    expect(values).toHaveLength(0);
  });
});
