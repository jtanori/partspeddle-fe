/**
 * SCGS Specification Framework
 *
 * Canonical domain model for declaring, grouping, and assigning values to
 * specifications. This is the vocabulary the SCGS compiler uses to interpret
 * raw catalog and listing data.
 *
 * @see docs/specifications/scgs-specification-framework.md
 */

export type SpecificationType = 'text' | 'number' | 'boolean' | 'enum';

export interface SpecificationValidationRule {
  min?: number;
  max?: number;
  pattern?: string;
  allowedValues?: string[];
  required?: boolean;
}

export interface SpecificationDefinition {
  id: string;
  key: string;
  label: string;
  type: SpecificationType;
  unit?: string;
  validation: SpecificationValidationRule;
  searchable: boolean;
  facetable: boolean;
}

export interface SpecificationGroup {
  name: string;
  order: number;
  definitions: SpecificationDefinition[];
}

export interface CategoryTemplate {
  categoryId: string;
  groups: SpecificationGroup[];
  inheritedDefinitions: SpecificationDefinition[];
}

export interface SpecificationValue {
  definition: SpecificationDefinition;
  rawValue: unknown;
  resolvedValue: string | number | boolean;
}

export interface SpecificationFrameworkInput {
  template: CategoryTemplate;
  values: SpecificationValue[];
}
