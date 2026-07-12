import { createHash } from 'node:crypto';
import { SpecificationRepository } from '@/repositories/specification.repository';
import { CatalogRepository } from '@/repositories/catalog.repository';
import { ListingRepository } from '@/repositories/listing.repository';
import { SpecificationValue } from '@/domain/types/marketplace.types';
import {
  ResolvedSpec,
  SpecGroup,
  CompiledSpecificationSet,
} from '../domain/compiled-specification-set';
import { CompiledSemanticArtifact, LineageId } from '../domain/compiled-semantic-artifact';
import { compileTrustProfile } from './trust-compiler';
import { compileCompatibility } from './compatibility-compiler';
import { compileFitment } from './fitment-compiler';
import type { TrustCompilerInput } from '../domain/trust-profile';
import type { RawCompatibilityEntry } from '../domain/compatibility-conclusion';

function coerceSpecificationValue(value: SpecificationValue): string | number | boolean {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
    return value;
  return JSON.stringify(value);
}

function computeChecksum(compiled: CompiledSpecificationSet): string {
  return createHash('sha256').update(JSON.stringify(compiled)).digest('hex');
}

function buildLineageId(listingId: string, version: string, checksum: string): LineageId {
  return `${listingId}:${version}:${checksum}` as LineageId;
}

export type { ResolvedSpec, SpecGroup, CompiledSpecificationSet };

export interface SpecificationCompiler {
  compile(input: {
    listingId: string;
    categoryId: string;
    version?: string;
    seller?: TrustCompilerInput;
    compatibility?: {
      entries: RawCompatibilityEntry[];
      partNumber?: string;
      oemPartNumber?: string;
    };
  }): Promise<CompiledSemanticArtifact>;
}

export class SpecificationCompilerImpl implements SpecificationCompiler {
  constructor(
    private readonly specRepo: SpecificationRepository,
    private readonly catalogRepo: CatalogRepository,
    private readonly listingRepo: ListingRepository,
  ) {}

  async compile(input: {
    listingId: string;
    categoryId: string;
    version?: string;
    seller?: TrustCompilerInput;
    compatibility?: {
      entries: RawCompatibilityEntry[];
      partNumber?: string;
      oemPartNumber?: string;
    };
  }): Promise<CompiledSemanticArtifact> {
    const {
      listingId,
      categoryId,
      version = '1.0.0',
      seller: sellerInput,
      compatibility: compatibilityInput,
    } = input;

    // Fetch dependencies
    const [specs, catSpecs, definitions, listing] = await Promise.all([
      this.specRepo.findByListingId(listingId),
      this.catalogRepo.getSpecificationsForCategory(categoryId),
      this.specRepo.getAllDefinitions(),
      this.listingRepo.findById(listingId),
    ]);

    const flat: ResolvedSpec[] = [];
    const groupedMap: Record<string, SpecGroup> = {};
    const facets: Record<string, string | number | boolean> = {};

    specs.forEach((spec) => {
      const def = definitions.find((d) => d.key === spec.key);
      const catSpec = catSpecs.find((cs) => cs.spec_definition_id === def?.id);

      if (!def || !catSpec) return;

      const groupName = catSpec.group_name || 'General';

      const resolved: ResolvedSpec = {
        key: def.key,
        label: def.label,
        value: coerceSpecificationValue(spec.value),
        unit: def.unit,
        group: groupName,
        groupOrder: catSpec.display_order || 0,
        displayOrder: catSpec.display_order || 0,
        isSearchable: def.searchable,
        isFacetable: def.facetable,
      };

      flat.push(resolved);

      if (def.facetable) {
        facets[def.key] = coerceSpecificationValue(spec.value);
      }

      if (!groupedMap[groupName]) {
        groupedMap[groupName] = { name: groupName, order: catSpec.display_order || 0, items: [] };
      }
      groupedMap[groupName].items.push(resolved);
    });

    const grouped = Object.values(groupedMap).sort((a, b) => a.order - b.order);
    grouped.forEach((g) => g.items.sort((a, b) => a.displayOrder - b.displayOrder));

    const listingQuality = listing?.listingQualityScore ?? 0.5;
    const sellerTrust = listing?.sellerTrustScore ?? 0.5;

    const trustProfile = compileTrustProfile(
      sellerInput ?? {
        sellerTrustScore: sellerTrust,
        listingQualityScore: listingQuality,
      },
    );

    const compatibilityConclusion = compileCompatibility({
      entries: compatibilityInput?.entries ?? [],
      partNumber: compatibilityInput?.partNumber,
      oemPartNumber: compatibilityInput?.oemPartNumber,
      specifications: flat.map((s) => ({ key: s.key, value: s.value })),
    });

    const fitmentConclusion = compileFitment({
      compatibility: {
        status: compatibilityConclusion.status,
        vehicles: compatibilityConclusion.vehicles,
      },
      specifications: flat.map((s) => ({ key: s.key, value: s.value })),
    });

    const compiled: CompiledSpecificationSet = {
      flat,
      grouped,
      facets,
      rankingFactors: {
        listingQuality,
        sellerTrust,
        recency: listing
          ? 1.0 - (Date.now() - new Date(listing.createdAt).getTime()) / (30 * 86400000)
          : 0.5,
      },
      trust: trustProfile,
      compatibility: compatibilityConclusion,
      fitment: fitmentConclusion,
    };

    const checksum = computeChecksum(compiled);
    const lineageId = buildLineageId(listingId, version, checksum);

    return {
      listingId,
      categoryId,
      version,
      lineageId,
      compiled,
      checksum,
      metadata: {
        createdAt: new Date().toISOString(),
        compilerVersion: '1.0.0',
      },
    };
  }
}
