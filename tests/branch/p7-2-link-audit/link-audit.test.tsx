import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf-8');
}

describe('P7.2 Link Audit', () => {
  describe('footer links', () => {
    const footer = readSource('src/components/Footer.tsx');

    it('uses real social platform URLs', () => {
      expect(footer).toContain('https://www.facebook.com');
      expect(footer).toContain('https://www.instagram.com');
      expect(footer).toContain('https://www.youtube.com');
      expect(footer).not.toContain('href="#facebook"');
      expect(footer).not.toContain('href="#instagram"');
      expect(footer).not.toContain('href="#youtube"');
    });

    it('links Browse Parts to /search', () => {
      expect(footer).toContain('href="/search"');
    });

    it('links About Company pages to real public routes', () => {
      expect(footer).toContain('href="/about"');
      expect(footer).toContain('href="/salvage-network"');
      expect(footer).toContain('href="/trust-verification"');
    });

    it('links Contact Support to /contact', () => {
      expect(footer).toContain('href="/contact"');
    });

    it('links legal pages to real routes', () => {
      expect(footer).toContain('href="/terms"');
      expect(footer).toContain('href="/privacy"');
    });
  });

  describe('auth footer links', () => {
    const authFooter = readSource('src/components/auth/AuthFooter.tsx');

    it('links to terms, privacy, and contact', () => {
      expect(authFooter).toContain("href: '/terms'");
      expect(authFooter).toContain("href: '/privacy'");
      expect(authFooter).toContain("href: '/contact'");
    });

    it('does not contain Back to Store', () => {
      expect(authFooter).not.toContain('Back to Store');
    });
  });

  describe('navbar links', () => {
    it('CTAButton routes buyer SELL PARTS to /seller/create', () => {
      const source = readSource('src/components/navbar/shared/CTAButton.tsx');
      expect(source).toContain("router.push('/seller/create')");
    });

    it('UserMenuContent routes to seller workspace and public pages', () => {
      const source = readSource('src/components/navbar/shared/UserMenuContent.tsx');
      expect(source).toContain("router.push('/seller/settings')");
      expect(source).toContain("router.push('/watchlist')");
      expect(source).toContain("router.push('/seller/orders')");
      expect(source).toContain("router.push('/seller')");
      expect(source).toContain("router.push('/seller/listings')");
    });

    it('MobileNavbar Browse routes to /search', () => {
      const source = readSource('src/components/navbar/shared/MobileNavbar.tsx');
      expect(source).toContain("router.push('/search')");
    });

    it('BottomTabBar routes tabs to real pages', () => {
      const source = readSource('src/components/navbar/BottomTabBar.tsx');
      expect(source).toContain("router.push('/')");
      expect(source).toContain("router.push('/search')");
      expect(source).toContain("router.push('/seller/orders')");
      expect(source).toContain("router.push('/profile')");
    });
  });

  describe('homepage links', () => {
    it('FeaturedSellers View Inventory links to public seller profile', () => {
      const source = readSource('src/components/homepage/FeaturedSellers.tsx');
      expect(source).toContain('router.push(`/seller/${seller.id}`)');
    });

    it('HighFidelityHero logged-in SELL PARTS links to /seller/create', () => {
      const source = readSource('src/components/homepage/HighFidelityHero.tsx');
      expect(source).toContain("router.push('/seller/create')");
    });
  });

  describe('search page links', () => {
    it('SellerGridCard View Inventory links to public seller profile', () => {
      const source = readSource('src/components/search/cards/SellerGridCard.tsx');
      expect(source).toContain('router.push(`/seller/${seller.id}`)');
    });

    it('VIN suggestions route to /search until decode-vin exists', () => {
      const source = readSource('src/components/search/utils/search-command-registry.ts');
      expect(source).toContain("type: 'vin'");
      expect(source).toContain('router.push(`/search?q=${encodeURIComponent(s.label)}`)');
      expect(source).not.toContain('/decode-vin');
    });
  });

  describe('PDP links', () => {
    it('PDPRoot category breadcrumb links to /search with category filter', () => {
      const source = readSource('src/components/pdp-modern/PDPRoot.tsx');
      expect(source).toContain(
        'href={`/search?category=${encodeURIComponent(viewModel.header.subtitle)}`}',
      );
    });

    it('SellerSupportCard links to public seller profile', () => {
      const source = readSource('src/components/pdp-modern/SellerSupportCard.tsx');
      expect(source).toContain('href={`/seller/${seller.id}`}');
    });

    it('NeedHelp has chat, tel, and mailto actions', () => {
      const source = readSource('src/components/pdp-modern/NeedHelp.tsx');
      expect(source).toContain('href="/chat"');
      expect(source).toContain('href="tel:+18005550199"');
      expect(source).toContain('href="mailto:support@partspeddle.com"');
    });

    it('DescriptionFitmentPanel links to fitment page', () => {
      const source = readSource('src/components/pdp-modern/DescriptionFitmentPanel.tsx');
      expect(source).toContain('href={`/listing/${partId}/fitment`}');
    });

    it('CompatibleParts rows link to PDP and view-more links to compatible-parts page', () => {
      const source = readSource('src/components/pdp-modern/CompatibleParts.tsx');
      expect(source).toContain('href={`/listing/${part.id}`}');
      expect(source).toContain('href={`/listing/${partId}/compatible-parts`}');
    });

    it('RecentlyViewed rows link to PDP and view-all links to recently-viewed page', () => {
      const source = readSource('src/components/pdp-modern/RecentlyViewed.tsx');
      expect(source).toContain('href={`/listing/${part.id}`}');
      expect(source).toContain('href="/recently-viewed"');
    });
  });

  describe('missing public pages exist', () => {
    it('has about, contact, terms, privacy, salvage-network, trust-verification pages', () => {
      const pages = [
        'src/app/(public)/about/page.tsx',
        'src/app/(public)/contact/page.tsx',
        'src/app/(public)/terms/page.tsx',
        'src/app/(public)/privacy/page.tsx',
        'src/app/(public)/salvage-network/page.tsx',
        'src/app/(public)/trust-verification/page.tsx',
      ];
      for (const page of pages) {
        expect(() => readSource(page)).not.toThrow();
      }
    });

    it('has profile, watchlist, chat, and recently-viewed pages', () => {
      const pages = [
        'src/app/(public)/profile/page.tsx',
        'src/app/(public)/watchlist/page.tsx',
        'src/app/(public)/chat/page.tsx',
        'src/app/(public)/recently-viewed/page.tsx',
      ];
      for (const page of pages) {
        expect(() => readSource(page)).not.toThrow();
      }
    });

    it('has PDP sub-routes', () => {
      const routes = [
        'src/app/(public)/listing/[id]/fitment/page.tsx',
        'src/app/(public)/listing/[id]/compatible-parts/page.tsx',
      ];
      for (const route of routes) {
        expect(() => readSource(route)).not.toThrow();
      }
    });
  });
});
