import { supabaseDb } from "../../../apps/web/src/services/supabase-db";
import { SEARCH_PARITY_CORPUS } from "./fixtures/search-corpus";

async function auditSignals() {
    const report: any = {
        listing_quality_score: { min: Infinity, max: -Infinity, values: [] },
        seller_trust_score: { min: Infinity, max: -Infinity, values: [] },
        created_at: { min: Infinity, max: -Infinity, values: [] }
    };

    for (const query of SEARCH_PARITY_CORPUS) {
        const { hits } = await supabaseDb.searchParts({ query } as any, "http://localhost:3000");

        for (const hit of hits) {
            const lqs = (hit as any).listing_quality_score || 0;
            const sts = (hit as any).seller_trust_score || 0;
            const cat = new Date((hit as any).created_at).getTime() || 0;

            report.listing_quality_score.min = Math.min(report.listing_quality_score.min, lqs);
            report.listing_quality_score.max = Math.max(report.listing_quality_score.max, lqs);
            report.listing_quality_score.values.push(lqs);

            report.seller_trust_score.min = Math.min(report.seller_trust_score.min, sts);
            report.seller_trust_score.max = Math.max(report.seller_trust_score.max, sts);
            report.seller_trust_score.values.push(sts);

            report.created_at.min = Math.min(report.created_at.min, cat);
            report.created_at.max = Math.max(report.created_at.max, cat);
            report.created_at.values.push(cat);
        }
    }

    // Calculate variance (simple range for now)
    const finalReport = {
        listing_quality_score: { min: report.listing_quality_score.min, max: report.listing_quality_score.max, variance: report.listing_quality_score.max - report.listing_quality_score.min },
        seller_trust_score: { min: report.seller_trust_score.min, max: report.seller_trust_score.max, variance: report.seller_trust_score.max - report.seller_trust_score.min },
        created_at: { min: report.created_at.min, max: report.created_at.max, variance: report.created_at.max - report.created_at.min }
    };

    console.log(JSON.stringify(finalReport, null, 2));
}

auditSignals().catch(console.error);
