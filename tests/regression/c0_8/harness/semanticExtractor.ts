import { normalizeValue } from "./normalize";

export type SemanticSignature = {
  groups: Array<{
    name: string;
    order: number;
    items: Array<{
      key: string;
      value: string | number | boolean;
      displayOrder: number;
    }>;
  }>;
  facets: Record<string, string | number | boolean>;
};

export function extractPDPSignature(pdp: any): SemanticSignature {
  return {
    groups: pdp.specifications.map((g: any) => ({
      name: g.name,
      order: g.displayOrder,
      items: g.specifications.map((i: any) => ({
        key: i.key,
        value: normalizeValue(i.value),
        displayOrder: i.displayOrder,
      })),
    })),
    facets: {},
  };
}

export function extractSearchSignature(search: any): SemanticSignature {
  return {
    groups: [],
    facets: Object.fromEntries(
      Object.entries(search.facets).map(([k, v]) => [
        k,
        normalizeValue(v),
      ])
    ),
  };
}
