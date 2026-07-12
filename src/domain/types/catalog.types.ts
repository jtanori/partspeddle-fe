// Catalog Governance Domain Types (P2)

export interface SpecificationDefinition {
  id: string;
  key: string;
  label: string;
  data_type: 'text' | 'number' | 'boolean' | 'enum';
  unit?: string;
  searchable: boolean;
  filterable: boolean;
  facetable: boolean;
  is_active: boolean;
  validation_rules: Record<string, unknown>;
}

export interface CatalogCategory {
  id: string;
  slug: string;
  name: string;
  parent_id?: string;
  wizard_template?: string;
  search_template?: string;
  pdp_template?: string;
}

export interface CatalogCategorySpecification {
  category_id: string;
  spec_definition_id: string;
  required: boolean;
  display_order: number;
  group_name?: string;
}

export interface SpecOption {
  id: string;
  spec_definition_id: string;
  value: string;
  label: string;
}
