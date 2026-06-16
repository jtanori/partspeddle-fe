import { 
  SpecificationDefinition, 
  CatalogCategorySpecification 
} from '../types/catalog.types';
import { SpecificationRepository } from '../../repositories/specification.repository';
import { CatalogRepository } from '../../repositories/catalog.repository';
import { ListingRepository } from '../../repositories/listing.repository';

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

export interface CompiledSpecificationSet {
  flat: ResolvedSpec[];
  grouped: SpecGroup[];
  facets: Record<string, string | number | boolean>;
  rankingFactors: {
    listingQuality: number;
    sellerTrust: number;
    recency: number;
  };
}

export interface SpecificationCompiler {
  compile(input: { listingId: string; categoryId: string }): Promise<CompiledSpecificationSet>;
}

export class SpecificationCompilerImpl implements SpecificationCompiler {
  constructor(
    private readonly specRepo: SpecificationRepository,
    private readonly catalogRepo: CatalogRepository,
    private readonly listingRepo: ListingRepository
  ) {}

  async compile(input: { listingId: string; categoryId: string }): Promise<CompiledSpecificationSet> {
    const { listingId, categoryId } = input;

    // Fetch dependencies
    const [specs, catSpecs, definitions, listing] = await Promise.all([
      this.specRepo.findByListingId(listingId),
      this.catalogRepo.getSpecificationsForCategory(categoryId),
      this.specRepo.getAllDefinitions(),
      this.listingRepo.findById(listingId)
    ]);

    const flat: ResolvedSpec[] = [];
    const groupedMap: Record<string, SpecGroup> = {};
    const facets: Record<string, string | number | boolean> = {};

    specs.forEach(spec => {
      const def = definitions.find(d => d.key === spec.key);
      const catSpec = catSpecs.find(cs => cs.spec_definition_id === def?.id);
      
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

      if (def.facetable) {
        facets[def.key] = spec.value;
      }

      if (!groupedMap[groupName]) {
        groupedMap[groupName] = { name: groupName, order: catSpec.display_order || 0, items: [] };
      }
      groupedMap[groupName].items.push(resolved);
    });

    const grouped = Object.values(groupedMap).sort((a, b) => a.order - b.order);
    grouped.forEach(g => g.items.sort((a, b) => a.displayOrder - b.displayOrder));

    return { 
      flat, 
      grouped, 
      facets,
      rankingFactors: {
        listingQuality: listing ? (listing as any).listing_quality_score || 0.5 : 0.5,
        sellerTrust: listing ? (listing as any).seller_trust_score || 0.5 : 0.5,
        recency: listing ? 1.0 - (Date.now() - new Date(listing.createdAt).getTime()) / (30 * 86400000) : 0.5 
      }
    };
  }
}
