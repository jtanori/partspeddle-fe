import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AUDIT_FIELD_NAMES,
  compareIndexFields,
  computeFacetParityPercent,
  deriveExpectedIndexFields,
  EXPECTED_FACET_ATTRIBUTES,
  passesFacetParityThreshold,
} from '@/lib/audit/search-audit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(__dirname, '../../../', relativePath), 'utf-8');
}

describe('P2.5 search drift and parity audits', () => {
  it('compares extended Algolia index fields against derived DB snapshots', () => {
    const expected = deriveExpectedIndexFields({
      id: 'part-1',
      title: 'Alternator',
      price_mxn: 1200,
      condition: 'USED_GOOD',
      listing_quality_score: 80,
      seller_trust_score: 90,
      part_types: {
        slug_en: 'alternator',
        categories: { slug_en: 'electrical' },
      },
      vehicle_variants: {
        models: {
          name: 'Civic',
          makes: { name: 'Honda' },
        },
      },
      users: {
        seller_profiles: {
          verification_status: 'verified',
        },
      },
    });

    expect(expected.category).toBe('electrical');
    expect(expected.part_type).toBe('alternator');
    expect(expected.make).toBe('Honda');
    expect(expected.seller_verified).toBe(true);

    const mismatches = compareIndexFields('part-1', expected, {
      ...expected,
      category: 'engine',
    });

    expect(mismatches).toHaveLength(1);
    expect(mismatches[0].field).toBe('category');
  });

  it('includes all planned audit fields in the consistency script', () => {
    const auditScript = read('platform/scripts/search/audit-search-consistency.ts');
    for (const field of AUDIT_FIELD_NAMES) {
      expect(auditScript).toContain(field);
    }
    expect(auditScript).toContain('process.exitCode = 1');
  });

  it('computes facet parity against expected Algolia facet attributes', () => {
    const parity = computeFacetParityPercent({
      category: { electrical: 2 },
      make: { Honda: 1 },
      model: { Civic: 1 },
      part_type: { alternator: 1 },
      year: { '2015': 1 },
      condition: { USED_GOOD: 1 },
      seller_verified: { true: 1 },
    });

    expect(parity).toBe(100);
    expect(
      passesFacetParityThreshold({
        category: { electrical: 1 },
      }),
    ).toBe(false);
    expect(EXPECTED_FACET_ATTRIBUTES).toContain('seller_verified');
  });

  it('adds search-parity to the platform audit script and nightly workflow', () => {
    const pkg = read('package.json');
    const nightly = read('.github/workflows/nightly-operational-validation.yml');
    const parityScript = read('platform/scripts/search/search-parity.ts');

    expect(pkg).toContain('platform/scripts/search/search-parity.ts');
    expect(parityScript).toContain('computeFacetParityPercent');
    expect(parityScript).toContain('process.exitCode = 1');
    expect(nightly).toContain('pnpm audit:search-platform');
    expect(nightly).toContain('ALGOLIA_ADMIN_KEY');
  });
});