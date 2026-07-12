import { createHash } from 'node:crypto';
import { ListingRepository } from '@/repositories/listing.repository';
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
import type { SpecificationFrameworkRepository } from '../domain/specification-framework-repository';

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

/**
 * SCGS specification compiler.
 *
 * Consumes the canonical SCGS specification framework (category template +
 * listing values) and produces a lineage-aware compiled semantic artifact.
 */
export class SpecificationCompilerImpl implements SpecificationCompiler {
  constructor(
    private readonly frameworkRepo: SpecificationFrameworkRepository,
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

    // Fetch framework data and listing in parallel.
    const [template, values, listing] = await Promise.all([
      this.frameworkRepo.getCategoryTemplate(categoryId),
      this.frameworkRepo.getValuesForListing(listingId),
      this.listingRepo.findById(listingId),
    ]);

    const flat: ResolvedSpec[] = [];
    const groupedMap: Record<string, SpecGroup> = {};
    const facets: Record<string, string | number | boolean> = {};

    // Index definitions by key and map each definition to its group.
    const allDefinitions = [
      ...template.inheritedDefinitions,
      ...template.groups.flatMap(g => g.definitions),
    ];
    const definitionByKey = new Map(allDefinitions.map(d => [d.key, d]));
    const groupByDefinitionKey = new Map<string, { name: string; order: number }>();
    template.groups.forEach((group) => {
      group.definitions.forEach((def) => {
        groupByDefinitionKey.set(def.key, { name: group.name, order: group.order });
      });
    });

    values.forEach((specValue) => {
      const def = definitionByKey.get(specValue.definition.key);
      const group = def ? groupByDefinitionKey.get(def.key) : undefined;
      const groupName = group?.name ?? 'General';
      const groupOrder = group?.order ?? 0;
      const displayOrder = group?.order ?? 0;

      if (!def) return;

      const resolved: ResolvedSpec = {
        key: def.key,
        label: def.label,
        value: specValue.resolvedValue,
        unit: def.unit,
        group: groupName,
        groupOrder,
        displayOrder,
        isSearchable: def.searchable,
        isFacetable: def.facetable,
      };

      flat.push(resolved);

      if (def.facetable) {
        facets[def.key] = specValue.resolvedValue;
      }

      if (!groupedMap[groupName]) {
        groupedMap[groupName] = { name: groupName, order: groupOrder, items: [] };
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
