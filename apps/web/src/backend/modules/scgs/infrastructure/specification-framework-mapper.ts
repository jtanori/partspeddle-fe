import {
  SpecificationDefinition as CatalogDefinition,
  CatalogCategorySpecification,
} from '@/domain/types/catalog.types';
import { ListingSpecification } from '@/domain/types/marketplace.types';
import {
  SpecificationType,
  SpecificationDefinition,
  SpecificationGroup,
  CategoryTemplate,
  SpecificationValue,
  SpecificationValidationRule,
} from '../domain/specification-framework';

function mapSpecificationType(dataType: string): SpecificationType {
  switch (dataType) {
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'enum':
      return 'enum';
    case 'text':
    default:
      return 'text';
  }
}

function mapValidationRules(
  validationRules: Record<string, unknown> | undefined,
): SpecificationValidationRule {
  if (!validationRules || typeof validationRules !== 'object') {
    return {};
  }

  const rules = validationRules as Record<string, unknown>;
  return {
    min: typeof rules.min === 'number' ? rules.min : undefined,
    max: typeof rules.max === 'number' ? rules.max : undefined,
    pattern: typeof rules.pattern === 'string' ? rules.pattern : undefined,
    allowedValues: Array.isArray(rules.allowedValues)
      ? rules.allowedValues.filter((v): v is string => typeof v === 'string')
      : undefined,
    required: typeof rules.required === 'boolean' ? rules.required : undefined,
  };
}

/**
 * Maps a catalog-level specification definition to the canonical SCGS framework
 * definition.
 */
export function mapSpecificationDefinition(def: CatalogDefinition): SpecificationDefinition {
  return {
    id: def.id,
    key: def.key,
    label: def.label,
    type: mapSpecificationType(def.data_type),
    unit: def.unit,
    validation: mapValidationRules(def.validation_rules),
    searchable: def.searchable,
    facetable: def.facetable,
  };
}

/**
 * Groups category specifications by their group name and produces canonical
 * SCGS specification groups.
 */
export function mapSpecificationGroups(
  definitions: CatalogDefinition[],
  categorySpecs: CatalogCategorySpecification[],
): SpecificationGroup[] {
  const definitionMap = new Map(definitions.map((d) => [d.id, d]));
  const groupedMap: Record<string, { order: number; definitions: SpecificationDefinition[] }> = {};

  categorySpecs.forEach((catSpec) => {
    const def = definitionMap.get(catSpec.spec_definition_id);
    if (!def) return;

    const groupName = catSpec.group_name || 'General';
    if (!groupedMap[groupName]) {
      groupedMap[groupName] = { order: catSpec.display_order || 0, definitions: [] };
    }

    groupedMap[groupName].definitions.push(mapSpecificationDefinition(def));
  });

  return Object.entries(groupedMap)
    .map(([name, { order, definitions }]) => ({
      name,
      order,
      definitions,
    }))
    .sort((a, b) => a.order - b.order);
}

/**
 * Builds a category template from catalog definitions and category specs.
 */
export function mapCategoryTemplate(
  categoryId: string,
  definitions: CatalogDefinition[],
  categorySpecs: CatalogCategorySpecification[],
): CategoryTemplate {
  const groupedSpecIds = new Set(categorySpecs.map((cs) => cs.spec_definition_id));
  const inheritedDefinitions = definitions
    .filter((d) => !groupedSpecIds.has(d.id))
    .map(mapSpecificationDefinition);

  return {
    categoryId,
    groups: mapSpecificationGroups(definitions, categorySpecs),
    inheritedDefinitions,
  };
}

function coerceValue(type: SpecificationType, value: unknown): string | number | boolean {
  if (value === null || value === undefined) return '';

  switch (type) {
    case 'number': {
      const num = typeof value === 'string' ? parseFloat(value) : Number(value);
      return Number.isFinite(num) ? num : 0;
    }
    case 'boolean':
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        const normalized = value.toLowerCase();
        return normalized === 'true' || normalized === 'yes' || normalized === '1';
      }
      if (typeof value === 'number') return value !== 0;
      return Boolean(value);
    case 'enum':
    case 'text':
    default:
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return value;
      }
      return JSON.stringify(value);
  }
}

/**
 * Maps listing specifications to canonical SCGS specification values.
 */
export function mapSpecificationValues(
  definitions: CatalogDefinition[],
  listingSpecs: ListingSpecification[],
): SpecificationValue[] {
  const definitionMap = new Map(definitions.map((d) => [d.key, d]));
  const values: SpecificationValue[] = [];

  listingSpecs.forEach((listingSpec) => {
    const def = definitionMap.get(listingSpec.key);
    if (!def) return;

    const frameworkDef = mapSpecificationDefinition(def);
    values.push({
      definition: frameworkDef,
      rawValue: listingSpec.value as unknown,
      resolvedValue: coerceValue(frameworkDef.type, listingSpec.value),
    });
  });

  return values;
}
