import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { organizationSchema, productSchema, breadcrumbListSchema } from '@/lib/seo/structured-data';

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf-8');
}

describe('P7.7 SEO & Accessibility Hardening', () => {
  it('exports structured data helpers', () => {
    const org = organizationSchema('https://partspeddle.com');
    expect(org['@type']).toBe('Organization');
    expect(org.name).toBe('PartsPeddle');

    const product = productSchema({
      name: 'OEM Alternator',
      price: 189.99,
      ratingValue: 4.7,
      reviewCount: 124,
    });
    expect(product['@type']).toBe('Product');
    expect(product.offers?.price).toBe(189.99);
    expect(product.aggregateRating?.reviewCount).toBe(124);

    const breadcrumbs = breadcrumbListSchema([
      { name: 'Home', href: '/' },
      { name: 'Search', href: '/search' },
      { name: 'Part' },
    ]);
    expect(breadcrumbs['@type']).toBe('BreadcrumbList');
    expect(breadcrumbs.itemListElement).toHaveLength(3);
  });

  it('public info pages include canonical metadata helper', () => {
    const source = readSource('apps/web/src/components/layout/PublicInfoPage.tsx');
    expect(source).toContain('publicInfoMetadata');
  });
});
