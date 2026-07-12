/**
 * Taxonomy source of truth helpers.
 *
 * Categories and part types are loaded from Supabase. Systems are derived from
 * a static mapping keyed by category `slug_en`. This keeps the UI hierarchy
 * stable while the catalog data remains the canonical source for categories,
 * part types, and their display labels.
 */

export interface TaxonomyCategory {
  id: string;
  slug: string;
  slug_en: string;
  name: string;
  name_en: string | null;
  name_es: string | null;
  icon: string | null;
  system: string;
}

export interface TaxonomyPartType {
  id: string;
  categoryId: string;
  slug: string;
  slug_en: string;
  name: string;
  name_en: string | null;
  name_es: string | null;
}

export interface Taxonomy {
  systems: string[];
  categoriesBySystem: Record<string, TaxonomyCategory[]>;
  partTypesByCategory: Record<string, TaxonomyPartType[]>;
  categoryBySlug: Record<string, TaxonomyCategory>;
  partTypeBySlug: Record<string, TaxonomyPartType>;
}

// Static system mapping by category slug_en. This is the lightweight bridge
// between the flat category table and the UI's system hierarchy. In the
// future this can move to a `system` column on `categories`.
const CATEGORY_SYSTEM_MAP: Record<string, string> = {
  drivetrain: "Powertrain",
  "body-collision": "Body & Exterior",
  "suspension-steering": "Suspension & Steering",
  "electrical-modules": "Electrical System",
  "hvac-cooling": "Electrical System",
  "brake-system": "Brake System",
  lighting: "Electrical System",
  "interior-safety": "Interior",
  "fuel-intake-systems": "Powertrain",
  "exhaust-emissions": "Powertrain",
  "glass-mirrors": "Body & Exterior",
  "wheels-tires": "Body & Exterior",
  "audio-infotainment": "Interior",
};

export function getSystemForCategory(slugEn: string): string {
  return CATEGORY_SYSTEM_MAP[slugEn] || "Other";
}

export function buildTaxonomy(
  categories: Array<{
    id: string;
    slug: string;
    slug_en: string | null;
    name: string;
    name_en: string | null;
    name_es: string | null;
    icon: string | null;
  }>,
  partTypes: Array<{
    id: string;
    category_id: string;
    slug: string;
    slug_en: string | null;
    name: string;
    name_en: string | null;
    name_es: string | null;
  }>,
): Taxonomy {
  const enrichedCategories: TaxonomyCategory[] = categories.map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    slug_en: cat.slug_en || cat.slug,
    name: cat.name,
    name_en: cat.name_en,
    name_es: cat.name_es,
    icon: cat.icon,
    system: getSystemForCategory(cat.slug_en || cat.slug),
  }));

  const enrichedPartTypes: TaxonomyPartType[] = partTypes.map((pt) => ({
    id: pt.id,
    categoryId: pt.category_id,
    slug: pt.slug,
    slug_en: pt.slug_en || pt.slug,
    name: pt.name,
    name_en: pt.name_en,
    name_es: pt.name_es,
  }));

  const categoriesBySystem: Record<string, TaxonomyCategory[]> = {};
  const categoryBySlug: Record<string, TaxonomyCategory> = {};

  for (const cat of enrichedCategories) {
    categoryBySlug[cat.slug_en] = cat;
    if (!categoriesBySystem[cat.system]) {
      categoriesBySystem[cat.system] = [];
    }
    categoriesBySystem[cat.system].push(cat);
  }

  const systems = Object.keys(categoriesBySystem).sort();

  const partTypesByCategory: Record<string, TaxonomyPartType[]> = {};
  const partTypeBySlug: Record<string, TaxonomyPartType> = {};

  for (const pt of enrichedPartTypes) {
    partTypeBySlug[pt.slug_en] = pt;
    if (!partTypesByCategory[pt.categoryId]) {
      partTypesByCategory[pt.categoryId] = [];
    }
    partTypesByCategory[pt.categoryId].push(pt);
  }

  return {
    systems,
    categoriesBySystem,
    partTypesByCategory,
    categoryBySlug,
    partTypeBySlug,
  };
}
