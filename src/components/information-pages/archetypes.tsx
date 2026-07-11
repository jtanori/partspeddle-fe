import * as React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Content } from '@/components/layout/design-system/Content';
import { Section } from '@/components/layout/design-system/Section';
import { Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { InformationPageHeader } from './InformationPageHeader';
import { InformationLayout } from './InformationLayout';
import { StickySidebar } from './StickySidebar';
import { EditorialCTA } from './EditorialCTA';

export interface EditorialPageShellProps {
  eyebrow: string;
  title: string;
  description?: string;
  breadcrumb: BreadcrumbItem[];
  children: React.ReactNode;
  cta?: React.ReactNode;
  className?: string;
}

/**
 * Common shell for all editorial/information pages.
 * Renders breadcrumb, page header, content section, and optional CTA.
 */
export function EditorialPageShell({
  eyebrow,
  title,
  description,
  breadcrumb,
  children,
  cta,
  className,
}: EditorialPageShellProps) {
  return (
    <div className={className}>
      <Content>
        <Breadcrumb items={breadcrumb} className="py-6" />
        <InformationPageHeader eyebrow={eyebrow} title={title} description={description} />
      </Content>

      <Section spacing="lg" className="bg-surface-secondary">
        <Content>{children}</Content>
      </Section>

      {cta ?? <EditorialCTA />}
    </div>
  );
}

export interface SimpleEditorialLayoutProps extends EditorialPageShellProps {
  /** Content rendered inside a centered single column. */
  content: React.ReactNode;
}

/**
 * Archetype A — Simple Editorial.
 * Best for: About, Careers, Shipping, Returns, Blog Articles.
 */
export function SimpleEditorialLayout({ content, ...shellProps }: SimpleEditorialLayoutProps) {
  return (
    <EditorialPageShell {...shellProps}>
      <div className="mx-auto max-w-3xl">{content}</div>
    </EditorialPageShell>
  );
}

export interface DocumentationLayoutProps extends EditorialPageShellProps {
  /** Main article content. */
  main: React.ReactNode;
  /** Sticky sidebar content (TOC, support card, related links). */
  sidebar: React.ReactNode;
}

/**
 * Archetype B — Documentation.
 * Best for: Terms, Privacy, Seller Policies, API Docs, Marketplace Rules.
 */
export function DocumentationLayout({ main, sidebar, ...shellProps }: DocumentationLayoutProps) {
  return (
    <EditorialPageShell {...shellProps}>
      <InformationLayout
        main={<article>{main}</article>}
        sidebar={<StickySidebar>{sidebar}</StickySidebar>}
      />
    </EditorialPageShell>
  );
}

export interface SupportCenterLayoutProps extends EditorialPageShellProps {
  /** Contact-method cards displayed below the header. */
  contactCards: React.ReactNode;
  /** Main form or content area. */
  main: React.ReactNode;
  /** Sidebar support cards. */
  sidebar: React.ReactNode;
  /** FAQ accordion items. */
  faqItems?: AccordionItem[];
}

/**
 * Archetype C — Support Center.
 * Best for: Contact, Help Center, Customer Service.
 */
export function SupportCenterLayout({
  contactCards,
  main,
  sidebar,
  faqItems,
  ...shellProps
}: SupportCenterLayoutProps) {
  return (
    <EditorialPageShell {...shellProps}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{contactCards}</div>

      <div className="mt-10">
        <InformationLayout main={main} sidebar={<StickySidebar>{sidebar}</StickySidebar>} />
      </div>

      {faqItems && faqItems.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 font-display text-section font-bold uppercase tracking-tight text-foreground-primary">
            Frequently asked questions
          </h2>
          <Accordion items={faqItems} />
        </div>
      )}
    </EditorialPageShell>
  );
}

export interface FeatureExplanationLayoutProps extends EditorialPageShellProps {
  /** Feature grid cards. */
  features: React.ReactNode;
  /** Process timeline component. */
  timeline?: React.ReactNode;
  /** Metrics/statistics cards. */
  metrics?: React.ReactNode;
  /** FAQ accordion items. */
  faqItems?: AccordionItem[];
}

/**
 * Archetype D — Feature Explanation.
 * Best for: Trust Verification, Buyer Protection, Escrow, Authentication, How It Works.
 */
export function FeatureExplanationLayout({
  features,
  timeline,
  metrics,
  faqItems,
  ...shellProps
}: FeatureExplanationLayoutProps) {
  return (
    <EditorialPageShell {...shellProps}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{features}</div>

      {timeline && <div className="mt-10">{timeline}</div>}

      {metrics && <div className="mt-10">{metrics}</div>}

      {faqItems && faqItems.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 font-display text-section font-bold uppercase tracking-tight text-foreground-primary">
            Frequently asked questions
          </h2>
          <Accordion items={faqItems} />
        </div>
      )}
    </EditorialPageShell>
  );
}

export interface ProgramLandingLayoutProps extends EditorialPageShellProps {
  /** Statistics cards. */
  statistics: React.ReactNode;
  /** Benefits grid cards. */
  benefits: React.ReactNode;
  /** Requirements or eligibility content. */
  requirements?: React.ReactNode;
  /** Process timeline component. */
  timeline?: React.ReactNode;
  /** Additional sections between requirements and CTA. */
  children?: React.ReactNode;
}

/**
 * Archetype E — Program / Network Landing.
 * Best for: Salvage Network, Seller Program, Fleet Program, Enterprise.
 */
export function ProgramLandingLayout({
  statistics,
  benefits,
  requirements,
  timeline,
  children,
  ...shellProps
}: ProgramLandingLayoutProps) {
  return (
    <EditorialPageShell {...shellProps}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{statistics}</div>

      <div className="mt-12">{benefits}</div>

      {timeline && <div className="mt-8">{timeline}</div>}

      {requirements && <div className="mt-10">{requirements}</div>}

      {children}
    </EditorialPageShell>
  );
}

export interface KnowledgeBaseCategory {
  id: string;
  title: string;
  description: string;
  href: string;
}

export interface KnowledgeBaseLayoutProps extends EditorialPageShellProps {
  /** Placeholder search query state handler. */
  onSearch?: (query: string) => void;
  /** Category grid items. */
  categories?: KnowledgeBaseCategory[];
  /** FAQ accordion items. */
  faqItems?: AccordionItem[];
  /** Help card or contact CTA rendered below the FAQ. */
  helpCard?: React.ReactNode;
}

/**
 * Archetype F — FAQ / Knowledge Base.
 * Best for: Help Center, Buyer Guide, Seller Guide.
 */
export function KnowledgeBaseLayout({
  onSearch,
  categories,
  faqItems,
  helpCard,
  ...shellProps
}: KnowledgeBaseLayoutProps) {
  return (
    <EditorialPageShell {...shellProps}>
      {onSearch && (
        <div className="relative mx-auto max-w-2xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <Input
            type="search"
            placeholder="Search help articles..."
            className="pl-9"
            onChange={(event) => onSearch(event.target.value)}
          />
        </div>
      )}

      {categories && categories.length > 0 && (
        <div className="mt-10">
          <KnowledgeBaseGrid categories={categories} />
        </div>
      )}

      {faqItems && faqItems.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 font-display text-section font-bold uppercase tracking-tight text-foreground-primary">
            Frequently asked questions
          </h2>
          <Accordion items={faqItems} />
        </div>
      )}

      {helpCard && <div className="mt-10">{helpCard}</div>}
    </EditorialPageShell>
  );
}

export interface ComparisonTrustLayoutProps extends EditorialPageShellProps {
  /** Trust metric cards. */
  metrics: React.ReactNode;
  /** Comparison table component. */
  comparisonTable?: React.ReactNode;
  /** Process timeline component. */
  timeline?: React.ReactNode;
  /** FAQ accordion items. */
  faqItems?: AccordionItem[];
}

/**
 * Archetype G — Comparison / Trust.
 * Best for: Buyer confidence pages.
 */
export function ComparisonTrustLayout({
  metrics,
  comparisonTable,
  timeline,
  faqItems,
  ...shellProps
}: ComparisonTrustLayoutProps) {
  return (
    <EditorialPageShell {...shellProps}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{metrics}</div>

      {comparisonTable && <div className="mt-10">{comparisonTable}</div>}

      {timeline && <div className="mt-10">{timeline}</div>}

      {faqItems && faqItems.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 font-display text-section font-bold uppercase tracking-tight text-foreground-primary">
            Frequently asked questions
          </h2>
          <Accordion items={faqItems} />
        </div>
      )}
    </EditorialPageShell>
  );
}

export interface ComparisonColumn {
  key: string;
  label: string;
}

export interface ComparisonRow {
  feature: string;
  values: Record<string, React.ReactNode>;
}

export interface ComparisonTableProps {
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
  highlightColumn?: string;
  className?: string;
}

/**
 * Comparison table for trust / buyer-confidence pages.
 */
export function ComparisonTable({
  columns,
  rows,
  highlightColumn,
  className,
}: ComparisonTableProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full min-w-[600px] border-collapse text-left">
        <thead>
          <tr className="border-b border-stroke-strong">
            <th className="py-3 pr-4 font-display text-caption font-bold uppercase tracking-widest text-foreground-muted">
              Feature
            </th>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'px-4 py-3 font-display text-caption font-bold uppercase tracking-widest',
                  highlightColumn === column.key ? 'text-brand-primary' : 'text-foreground-muted',
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.feature}
              className={cn(
                'border-b border-stroke-subtle',
                index % 2 === 0 ? 'bg-surface-primary' : 'bg-transparent',
              )}
            >
              <td className="py-3 pr-4 font-sans text-body font-medium text-foreground-primary">
                {row.feature}
              </td>
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'px-4 py-3 font-sans text-body text-foreground-secondary',
                    highlightColumn === column.key && 'bg-brand-primary/5',
                  )}
                >
                  {row.values[column.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export interface FAQSearchProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Search input wired for FAQ / knowledge base filtering.
 */
export function FAQSearch({
  value,
  onChange,
  placeholder = 'Search questions...',
  className,
}: FAQSearchProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
      <Input
        type="search"
        value={value}
        placeholder={placeholder}
        className="pl-9"
        onChange={(event) => onChange?.(event.target.value)}
      />
    </div>
  );
}

export interface KnowledgeBaseGridProps {
  categories: KnowledgeBaseCategory[];
  className?: string;
}

/**
 * Category grid for knowledge-base / help-center landing pages.
 */
export function KnowledgeBaseGrid({ categories, className }: KnowledgeBaseGridProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {categories.map((category) => (
        <a
          key={category.id}
          href={category.href}
          className="group rounded-xl border border-stroke-subtle bg-surface-primary p-5 shadow-card transition-colors hover:border-brand-primary/30 hover:bg-brand-primary/5"
        >
          <h3 className="font-display text-card-title font-bold uppercase tracking-tight text-foreground-primary group-hover:text-brand-primary">
            {category.title}
          </h3>
          <p className="mt-2 font-sans text-body leading-relaxed text-foreground-secondary">
            {category.description}
          </p>
        </a>
      ))}
    </div>
  );
}
