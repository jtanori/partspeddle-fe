export type SuggestionType =
  | "product"
  | "vehicle"
  | "system"
  | "part_type"
  | "manufacturer"
  | "vin"
  | "part_number"
  | "section_view_all";

export interface SearchSuggestion {
  id: string;
  type: SuggestionType;
  label: string;
  metadata?: unknown;
}

export interface ProjectionMetadata {
  totalHits: number;
  query: string;
  generatedAt: number;
}

export interface GroupedSuggestion {
  hits: SearchSuggestion[];
  total: number;
}

export interface LiveSearchResults {
  metadata: ProjectionMetadata;
  products: GroupedSuggestion;
  vehicles: GroupedSuggestion;
  taxonomy: GroupedSuggestion; // system and part_type
  manufacturers: GroupedSuggestion;
}

export interface SearchCommand {
  type: SuggestionType;
  execute(suggestion: SearchSuggestion): void;
}
