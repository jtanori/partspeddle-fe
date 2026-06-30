import { 
  SpecificationDefinition, 
  CatalogCategorySpecification 
} from '../types/catalog.types';
import { ListingSpecification } from '../marketplace.types';

export interface ResolvedSpec {
  key: string;
  label: string;
  value: string | number | boolean;
  unit?: string;
  group: string;
  groupOrder: number;
  displayOrder: number;
  isSearchable: boolean;
  isFacetable: boolean;
}

export interface SpecGroup {
  name: string;
  order: number;
  items: ResolvedSpec[];
}

export interface ResolvedSpecificationSet {
  flat: ResolvedSpec[];
  grouped: SpecGroup[];
  facets: Record<string, string | number | boolean>;
}

export interface SpecificationResolver {
  resolve(
    specs: ListingSpecification[],
    definitions: SpecificationDefinition[],
    categorySpecs: CatalogCategorySpecification[]
  ): ResolvedSpecificationSet;
}

export class SpecificationResolverImpl implements SpecificationResolver {
  resolve(
    specs: ListingSpecification[],
    definitions: SpecificationDefinition[],
    categorySpecs: CatalogCategorySpecification[]
  ): ResolvedSpecificationSet {
    const flat: ResolvedSpec[] = [];
    const groupedMap: Record<string, SpecGroup> = {};
    const facets: Record<string, string | number | boolean> = {};

    specs.forEach(spec => {
      const def = definitions.find(d => d.key === spec.key);
      const catSpec = categorySpecs.find(cs => cs.spec_definition_id === def?.id);
      
      if (!def || !catSpec) return;

      const groupName = catSpec.group_name || 'General';

      const resolved: ResolvedSpec = {
        key: def.key,
        label: def.label,
        value: spec.value,
        unit: def.unit,
        group: groupName,
        groupOrder: catSpec.display_order || 0,
        displayOrder: catSpec.display_order || 0,
        isSearchable: def.searchable,
        isFacetable: def.facetable
      };

      flat.push(resolved);

      // Facet Projection
      if (def.facetable) {
        facets[def.key] = spec.value;
      }

      // Grouping
      if (!groupedMap[groupName]) {
        groupedMap[groupName] = { name: groupName, order: catSpec.display_order || 0, items: [] };
      }
      groupedMap[groupName].items.push(resolved);
    });

    const grouped = Object.values(groupedMap).sort((a, b) => a.order - b.order);
    grouped.forEach(g => g.items.sort((a, b) => a.displayOrder - b.displayOrder));

    return { flat, grouped, facets };
  }
}
