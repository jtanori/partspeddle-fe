import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { navigation, registry } from '@/navigation';

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf-8');
}

describe('P7.6 PPDS Navigation Registry', () => {
  describe('registry structure', () => {
    it('includes marketplace routes', () => {
      expect(registry.home).toBeDefined();
      expect(registry.search).toBeDefined();
      expect(registry.partDetail).toBeDefined();
    });

    it('includes workspace routes', () => {
      expect(registry.sellerDashboard).toBeDefined();
      expect(registry.sellerInventory).toBeDefined();
    });

    it('includes editorial routes', () => {
      expect(registry.about).toBeDefined();
      expect(registry.contact).toBeDefined();
      expect(registry.terms).toBeDefined();
      expect(registry.privacy).toBeDefined();
    });
  });

  describe('href generation', () => {
    it('generates static hrefs', () => {
      expect((registry.home.href as () => string)()).toBe('/');
      expect((registry.search.href as () => string)()).toBe('/search');
      expect((registry.about.href as () => string)()).toBe('/about');
    });

    it('generates dynamic hrefs with typed params', () => {
      expect(
        (registry.partDetail.href as (params: { partId: string }) => string)({ partId: '123' }),
      ).toBe('/listing/123');
      expect(
        (registry.sellerProfile.href as (params: { sellerId: string }) => string)({
          sellerId: 'abc',
        }),
      ).toBe('/seller/abc');
    });

    it('throws on missing dynamic params', () => {
      expect(() => (registry.partDetail.href as () => string)()).toThrow();
    });
  });

  describe('menu builders', () => {
    it('builds main menu from navPosition main', () => {
      const items = navigation.mainMenu;
      expect(items.some((item) => item.id === 'home')).toBe(true);
      expect(items.some((item) => item.id === 'search')).toBe(true);
    });

    it('builds footer menu from navPosition footer', () => {
      const items = navigation.footerMenu;
      expect(items.some((item) => item.id === 'about')).toBe(true);
      expect(items.some((item) => item.id === 'contact')).toBe(true);
    });

    it('builds sidebar menu from navPosition sidebar', () => {
      const items = navigation.sidebarMenu;
      expect(items.some((item) => item.id === 'seller-dashboard')).toBe(true);
      expect(items.some((item) => item.id === 'seller-inventory')).toBe(true);
    });
  });

  describe('sitemap builder', () => {
    it('generates public static routes only', () => {
      const sitemap = navigation.sitemap('https://partspeddle.com');
      const paths = sitemap.map((entry) => entry.loc);
      expect(paths).toContain('https://partspeddle.com/');
      expect(paths).toContain('https://partspeddle.com/about');
      expect(paths).not.toContain('https://partspeddle.com/listing/123');
    });

    it('generates valid XML', () => {
      const xml = navigation.sitemapXml('https://partspeddle.com');
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
      expect(xml).toContain('https://partspeddle.com/');
    });
  });

  describe('breadcrumbs', () => {
    it('generates breadcrumbs with home and parent chain', () => {
      const crumbs = navigation.breadcrumbs('partFitment');
      expect(crumbs[0]).toEqual({ label: 'Home', href: '/' });
      expect(crumbs[crumbs.length - 1]).toEqual({ label: 'Part Fitment' });
    });
  });

  describe('metadata builder', () => {
    it('builds page metadata from route', () => {
      const meta = navigation.metadata('about');
      expect(meta.title).toBe('About PartsPeddle');
      expect(meta.description).toContain('PartsPeddle');
    });
  });

  describe('guards', () => {
    it('exports permission and feature-flag guards', () => {
      const source = readSource('src/navigation/index.ts');
      expect(source).toContain('hasPermission');
      expect(source).toContain('isFeatureEnabled');
    });
  });
});
