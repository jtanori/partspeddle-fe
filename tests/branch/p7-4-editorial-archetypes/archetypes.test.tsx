import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf-8');
}

describe('P7.4 Editorial Page Archetypes', () => {
  describe('archetype layouts exist', () => {
    const source = readSource('src/components/information-pages/archetypes.tsx');

    it('exports all seven archetype layouts', () => {
      expect(source).toContain('export function SimpleEditorialLayout');
      expect(source).toContain('export function DocumentationLayout');
      expect(source).toContain('export function SupportCenterLayout');
      expect(source).toContain('export function FeatureExplanationLayout');
      expect(source).toContain('export function ProgramLandingLayout');
      expect(source).toContain('export function KnowledgeBaseLayout');
      expect(source).toContain('export function ComparisonTrustLayout');
    });

    it('exports missing helper components', () => {
      expect(source).toContain('export function ComparisonTable');
      expect(source).toContain('export function FAQSearch');
      expect(source).toContain('export function KnowledgeBaseGrid');
    });
  });

  describe('existing public pages derive from archetypes', () => {
    it('About uses SimpleEditorialLayout', () => {
      const source = readSource('src/app/(public)/about/page.tsx');
      expect(source).toContain('SimpleEditorialLayout');
      expect(source).not.toContain('<Breadcrumb');
      expect(source).not.toContain('<InformationPageHeader');
    });

    it('Terms uses DocumentationLayout', () => {
      const source = readSource('src/app/(public)/terms/page.tsx');
      expect(source).toContain('DocumentationLayout');
      expect(source).not.toContain('<Breadcrumb');
      expect(source).not.toContain('<InformationPageHeader');
    });

    it('Privacy uses DocumentationLayout', () => {
      const source = readSource('src/app/(public)/privacy/page.tsx');
      expect(source).toContain('DocumentationLayout');
      expect(source).not.toContain('<Breadcrumb');
      expect(source).not.toContain('<InformationPageHeader');
    });

    it('Contact uses SupportCenterLayout', () => {
      const source = readSource('src/app/(public)/contact/page.tsx');
      expect(source).toContain('SupportCenterLayout');
      expect(source).not.toContain('<Breadcrumb');
      expect(source).not.toContain('<InformationPageHeader');
    });

    it('Trust Verification uses FeatureExplanationLayout', () => {
      const source = readSource('src/app/(public)/trust-verification/page.tsx');
      expect(source).toContain('FeatureExplanationLayout');
      expect(source).not.toContain('<Breadcrumb');
      expect(source).not.toContain('<InformationPageHeader');
    });

    it('Salvage Network uses ProgramLandingLayout', () => {
      const source = readSource('src/app/(public)/salvage-network/page.tsx');
      expect(source).toContain('ProgramLandingLayout');
      expect(source).not.toContain('<Breadcrumb');
      expect(source).not.toContain('<InformationPageHeader');
    });
  });

  describe('archetypes are re-exported from information-pages index', () => {
    const source = readSource('src/components/information-pages/index.ts');

    it('exports archetypes module', () => {
      expect(source).toContain("export * from './archetypes'");
    });
  });

  describe('design system documentation', () => {
    it('has editorial archetypes doc', () => {
      const source = readSource('docs/design-system/09-editorial-page-archetypes.md');
      expect(source).toContain('SimpleEditorialLayout');
      expect(source).toContain('DocumentationLayout');
      expect(source).toContain('SupportCenterLayout');
    });
  });
});
