
import { supabaseAdmin } from '../src/lib/supabase-admin';
import { algoliaClient, SEARCH_INDEX_NAME } from '../src/backend/modules/search/infrastructure/algolia-client';
import { logger } from '../src/lib/logger';

interface AuditResult {
  partsInDb: number;
  partsInIndex: number;
  missingFromIndex: string[];
  staleInIndex: string[];
  attributeMismatches: { id: string; field: string; db: any; algolia: any }[];
  driftPercent: number;
}

async function auditSearchConsistency(): Promise<AuditResult> {
  logger.info('Starting search consistency audit...');

  // 1. Get all active part IDs and critical attributes from Supabase
  const { data: dbParts, error: dbError } = await supabaseAdmin
    .from('parts')
    .select('id, status, title, price, condition, compatibility');

  if (dbError) {
    logger.error('Failed to fetch parts from database', { error: dbError });
    throw dbError;
  }
  
  const dbPartsMap = new Map(dbParts.map(p => [p.id, p]));
  const dbPartIds = new Set(dbPartsMap.keys());

  // 2. Get all objects from Algolia
  const indexPartsMap = new Map<string, any>();
  await algoliaClient.browseObjects<any>({
    indexName: SEARCH_INDEX_NAME,
    attributesToRetrieve: ['objectID', 'status', 'title', 'price', 'condition', 'compatibility'],
    batch: (hits) => {
      hits.forEach(hit => indexPartsMap.set(hit.objectID, hit));
    },
  });
  const indexPartIds = new Set(indexPartsMap.keys());
  
  // 3. Compare and find discrepancies
  const missingFromIndex = [...dbPartIds].filter(id => !indexPartIds.has(id));
  const staleInIndex = [...indexPartIds].filter(id => !dbPartIds.has(id));
  
  const attributeMismatches: { id: string; field: string; db: any; algolia: any }[] = [];
  const commonIds = [...dbPartIds].filter(id => indexPartIds.has(id));

  for (const id of commonIds) {
    const dbPart = dbPartsMap.get(id)!;
    const indexPart = indexPartsMap.get(id)!;

    const fieldsToCompare = ['title', 'price', 'condition'];
    for (const field of fieldsToCompare) {
      if (dbPart[field as keyof typeof dbPart] !== indexPart[field]) {
        attributeMismatches.push({
          id,
          field,
          db: dbPart[field as keyof typeof dbPart],
          algolia: indexPart[field]
        });
      }
    }
  }

  const totalDrift = missingFromIndex.length + staleInIndex.length + attributeMismatches.length;
  const driftPercent = dbPartIds.size > 0 
    ? (totalDrift / dbPartIds.size) * 100
    : 0;

  const result: AuditResult = {
    partsInDb: dbPartIds.size,
    partsInIndex: indexPartIds.size,
    missingFromIndex,
    staleInIndex,
    attributeMismatches,
    driftPercent: parseFloat(driftPercent.toFixed(2)),
  };

  logger.info('Search consistency audit complete', result);
  console.log(JSON.stringify(result, null, 2));

  return result;
}

auditSearchConsistency();
