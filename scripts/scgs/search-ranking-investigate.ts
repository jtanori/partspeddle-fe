import { SpecificationCompilerImpl } from '../../src/domain/services/specification.compiler';
import { RankingEngine } from '../../src/domain/specification/scgs/ranking/ranking.engine';
import { supabaseDb } from "../../src/services/supabase-db";
import { CompiledSemanticArtifact } from '../../src/domain/specification/scgs/types';
import { SupabaseListingRepository } from "../../src/infrastructure/supabase-listing.repository";
import { supabaseAdmin } from "../../src/lib/supabase-admin";

// Real repositories
const specRepo: any = { findByListingId: async () => [], getAllDefinitions: async () => [] };
const catRepo: any = { getCategory: async () => null, getSpecificationsForCategory: async () => [], getDefinition: async () => null };
const listingRepo = new SupabaseListingRepository();

const compiler = new SpecificationCompilerImpl(specRepo, catRepo, listingRepo);

async function investigate(query: string) {
    // 1. Fetch Algolia hits (the "Truth" we want to reproduce)
    const { hits: algoliaHits } = await supabaseDb.searchParts({ query } as any, "http://localhost:3000");

    // 2. Project via compiler to get Real Ranking Factors
    const artifacts: CompiledSemanticArtifact[] = await Promise.all(algoliaHits.map(async (h: any) => {
        // Resolve listing ID if needed
        const { data: part } = await supabaseAdmin.from("parts").select("listing_id").eq("id", h.objectID).single();
        const listingId = part?.listing_id || h.objectID;
        
        const compiled = await compiler.compile({ listingId: listingId, categoryId: h.category_id || 'default' });
        return {
            listingId: listingId,
            categoryId: h.category_id || 'default',
            version: 'v1',
            compiled,
            checksum: 'none',
            metadata: { createdAt: '', compilerVersion: '1.0.0' }
        } as unknown as CompiledSemanticArtifact;
    }));

    // 3. Run Ranking Engine
    const ranked = RankingEngine.rank(artifacts);

    // 4. Output Investigation Data
    console.log(JSON.stringify({
        query,
        scgs: ranked.slice(0, 5).map(r => ({
            listingId: r.listingId,
            finalScore: r.explanation.finalScore,
            factors: r.explanation.contributions.reduce((acc, c) => ({ ...acc, [c.factor]: c.rawValue }), {})
        }))
    }, null, 2));
}

const query = process.argv[2] || "alternator";
investigate(query).catch(console.error);
