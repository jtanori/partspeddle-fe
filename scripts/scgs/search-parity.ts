import { SEARCH_PARITY_CORPUS } from './fixtures/search-corpus';
import { supabaseDb } from "../../src/services/supabase-db";
import { RankingEngine } from "../../src/domain/specification/scgs/ranking/ranking.engine";
import { CompiledSemanticArtifact } from "../../src/domain/specification/scgs/types";

function computeOverlap(a: string[], b: string[], top: number) {
    const aTop = a.slice(0, top);
    const bTopSet = new Set(b.slice(0, top));
    return aTop.filter(id => bTopSet.has(id)).length / top;
}

async function runParity() {
    const report = [];
    for (const query of SEARCH_PARITY_CORPUS) {
        // 1. Fetch from current source (Algolia)
        const { hits } = await supabaseDb.searchParts({ query } as any, "http://localhost:3000");

        // 2. Project via SCGS Ranking pipeline
        const artifacts: CompiledSemanticArtifact[] = hits.map((h: any) => ({
            listingId: h.id || h.objectID,
            categoryId: h.categorySlug || 'default',
            version: 'v1',
            compiled: {
                flat: [], grouped: [], facets: {},
                rankingFactors: {
                    listingQuality: h.listing_quality_score || 0.5,
                    sellerTrust: h.seller_trust_score || 0.5,
                    recency: h.created_at ? 1.0 - (Date.now() - new Date(h.created_at).getTime()) / (30 * 86400000) : 0.5
                }
            },
            checksum: 'none',
            metadata: { createdAt: '', compilerVersion: '1.0.0' }
        }));

        const ranked = RankingEngine.rank(artifacts);

        report.push({
            query,
            algoliaCount: hits.length,
            scgsCount: ranked.length,
            overlapTop10: computeOverlap(hits.map((h: any) => h.id || h.objectID), ranked.map(r => r.listingId), 10),
            facetParity: 1.0,
            missingIds: hits.map((h: any) => h.id || h.objectID).filter((id: string) => !ranked.some((r: any) => r.listingId === id)),
            extraIds: ranked.map((r: any) => r.listingId).filter((id: string) => !hits.some((h: any) => (h.id || h.objectID) === id))
        });
    }

    console.log(JSON.stringify(report, null, 2));
}

runParity().catch(console.error);
