import { algoliaClient, SEARCH_INDEX_NAME } from "../../src/backend/modules/search/infrastructure/algolia-client";
import { SpecificationCompilerImpl } from "../../src/domain/services/specification.compiler";
import { RankingEngine } from "../../src/domain/specification/scgs/ranking/ranking.engine";
import { CompiledSemanticArtifact } from "../../src/domain/specification/scgs/types";
import { SupabaseListingRepository } from "../../src/infrastructure/supabase-listing.repository";

// Use actual repository
const mockSpecRepo: any = { findByListingId: async () => [], getAllDefinitions: async () => [] };
const mockCatRepo: any = { getCategory: async () => null, getSpecificationsForCategory: async () => [], getDefinition: async () => null };
const listingRepo = new SupabaseListingRepository();

const compiler = new SpecificationCompilerImpl(mockSpecRepo, mockCatRepo, listingRepo);

async function debugRanking(query: string) {
    const results = await algoliaClient.search({
        requests: [{ indexName: SEARCH_INDEX_NAME, query, hitsPerPage: 5 }]
    });

    const hits = (results.results[0] as any).hits;

    const artifacts: CompiledSemanticArtifact[] = await Promise.all(hits.map(async (h: any) => {
        const compiled = await compiler.compile({ listingId: h.objectID, categoryId: h.categorySlug || 'default' });
        return {
            listingId: h.objectID,
            categoryId: h.categorySlug || 'default',
            version: 'v1',
            compiled,
            checksum: 'none',
            metadata: { createdAt: '', compilerVersion: '1.0.0' },
            rankingFactors: compiled.rankingFactors
        } as unknown as CompiledSemanticArtifact;
    }));

    const ranked = RankingEngine.rank(artifacts);

    console.log(JSON.stringify({
        query,
        scgs: ranked.map(r => ({
            listingId: r.listingId,
            score: r.score,
            factors: r.explanation.contributions
        }))
    }, null, 2));
}

debugRanking("alternator").catch(console.error);
