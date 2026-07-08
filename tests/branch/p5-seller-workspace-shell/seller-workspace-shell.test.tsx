import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import SellerListingsPage from '@/app/(seller)/seller/listings/page';
import SellerCustomersPage from '@/app/(seller)/seller/customers/page';
import SellerMessagesPage from '@/app/(seller)/seller/messages/page';
import SellerAnalyticsPage from '@/app/(seller)/seller/analytics/page';
import SellerFinancialPage from '@/app/(seller)/seller/financial/page';

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

function readSource(relativePath: string) {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf-8');
}

describe('P5.0 Seller Workspace Shell', () => {
  describe('placeholder pages', () => {
    it('listings page renders with PageHeader', () => {
      render(<SellerListingsPage />);
      expect(screen.getByRole('heading', { name: 'Listings' })).toBeDefined();
      expect(screen.getByText('Manage published drafts and active part listings.')).toBeDefined();
    });

    it('customers page renders with PageHeader', () => {
      render(<SellerCustomersPage />);
      expect(screen.getByRole('heading', { name: 'Customers' })).toBeDefined();
    });

    it('messages page renders with PageHeader', () => {
      render(<SellerMessagesPage />);
      expect(screen.getByRole('heading', { name: 'Messages' })).toBeDefined();
    });

    it('analytics page renders with PageHeader', () => {
      render(<SellerAnalyticsPage />);
      expect(screen.getByRole('heading', { name: 'Analytics' })).toBeDefined();
    });

    it('financial page renders with PageHeader', () => {
      render(<SellerFinancialPage />);
      expect(screen.getByRole('heading', { name: 'Financial' })).toBeDefined();
    });

    it('each new page source imports PageHeader', () => {
      const pages = [
        'src/app/(seller)/seller/listings/page.tsx',
        'src/app/(seller)/seller/customers/page.tsx',
        'src/app/(seller)/seller/messages/page.tsx',
        'src/app/(seller)/seller/analytics/page.tsx',
        'src/app/(seller)/seller/financial/page.tsx',
      ];
      for (const page of pages) {
        const source = readSource(page);
        expect(source, page).toMatch(
          /import\s+\{[^}]*PageHeader[^}]*\}\s+from\s+['"]@\/components\/workspace['"]/,
        );
      }
    });
  });

  describe('seller layout sidebar', () => {
    it('includes workspace navigation hrefs', async () => {
      const { default: SellerLayout } = await import('@/app/(seller)/layout');
      render(
        <SellerLayout>
          <div data-testid="content">Content</div>
        </SellerLayout>,
      );

      const requiredHrefs = [
        '/seller/listings',
        '/seller/customers',
        '/seller/messages',
        '/seller/analytics',
        '/seller/financial',
      ];

      const links = screen.getAllByRole('link');
      const hrefs = links.map((link) => link.getAttribute('href'));

      for (const href of requiredHrefs) {
        expect(hrefs).toContain(href);
      }
    });
  });

  describe('loading state migration', () => {
    it('InventoryTable no longer imports InlineLoadingIndicator and imports Skeleton', () => {
      const source = readSource('src/components/seller-dashboard/InventoryTable.tsx');
      expect(source).not.toContain('InlineLoadingIndicator');
      expect(source).toContain("from '@/components/ui/skeleton'");
      expect(source).toContain('<Skeleton');
    });

    it('SettingsForm no longer imports InlineLoadingIndicator and imports Skeleton', () => {
      const source = readSource('src/components/seller-dashboard/SettingsForm.tsx');
      expect(source).not.toContain('InlineLoadingIndicator');
      expect(source).toContain("from '@/components/ui/skeleton'");
      expect(source).toContain('<Skeleton');
    });
  });
});
