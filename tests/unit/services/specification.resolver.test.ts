import { describe, it, expect } from 'vitest';
import { SpecificationResolverImpl } from '../../src/domain/services/specification.resolver';
import { ListingSpecification } from '../../src/domain/marketplace.types';
import { SpecificationDefinition, CatalogCategorySpecification } from '../../src/domain/types/catalog.types';

describe('SpecificationResolver', () => {
  const resolver = new SpecificationResolverImpl();

  it('correctly resolves and groups specifications', () => {
    const specs: ListingSpecification[] = [
      { key: 'voltage', value: '12V' },
      { key: 'amperage', value: 120 }
    ];

    const definitions: SpecificationDefinition[] = [
      { id: 'def_v', key: 'voltage', label: 'Voltage', data_type: 'text', unit: 'V', searchable: true, filterable: true, facetable: true, is_active: true, validation_rules: {} },
      { id: 'def_a', key: 'amperage', label: 'Amperage', data_type: 'number', unit: 'A', searchable: true, filterable: true, facetable: true, is_active: true, validation_rules: {} }
    ];

    const categorySpecs: CatalogCategorySpecification[] = [
      { category_id: 'cat_alt', spec_definition_id: 'def_v', required: true, display_order: 1, group_name: 'Electrical' },
      { category_id: 'cat_alt', spec_definition_id: 'def_a', required: true, display_order: 2, group_name: 'Electrical' }
    ];

    const resolved = resolver.resolve(specs, definitions, categorySpecs);

    expect(resolved.grouped).toHaveLength(1);
    expect(resolved.grouped[0].name).toBe('Electrical');
    expect(resolved.grouped[0].items).toHaveLength(2);
    expect(resolved.facets.voltage).toBe('12V');
    expect(resolved.facets.amperage).toBe(120);
  });
});
