import React from 'react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  InformationPageHeader,
  InformationLayout,
  StickySidebar,
  EditorialSection,
  InfoCallout,
  SupportCard,
  RelatedLinksCard,
  ContactMethodCard,
  NetworkStatisticCard,
  TrustFeatureCard,
  VerificationProcessTimeline,
  TableOfContents,
  ContactForm,
  EditorialCTA,
} from '@/components/information-pages';

import AboutPage from '@/app/(public)/about/page';
import ContactPage from '@/app/(public)/contact/page';
import TermsPage from '@/app/(public)/terms/page';
import PrivacyPage from '@/app/(public)/privacy/page';
import SalvageNetworkPage from '@/app/(public)/salvage-network/page';
import TrustVerificationPage from '@/app/(public)/trust-verification/page';

import { PublicInfoPage } from '@/components/layout/PublicInfoPage';

beforeAll(() => {
  global.IntersectionObserver = vi.fn().mockImplementation(function () {
    return {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    };
  }) as unknown as typeof IntersectionObserver;
});

describe('IPS foundation components', () => {
  it('InformationPageHeader renders eyebrow, title, and description', () => {
    render(
      <InformationPageHeader
        eyebrow="SUPPORT"
        title="We're here to help."
        description="Questions about orders, listings, or partnerships."
      />,
    );
    expect(screen.getByText("We're here to help.")).toBeDefined();
    expect(screen.getByText('SUPPORT')).toBeDefined();
    expect(screen.getByText('Questions about orders, listings, or partnerships.')).toBeDefined();
  });

  it('InformationLayout renders main and sidebar columns', () => {
    render(
      <InformationLayout
        data-testid="layout"
        main={<div data-testid="main">main</div>}
        sidebar={<div data-testid="sidebar">sidebar</div>}
      />,
    );
    const layout = screen.getByTestId('layout');
    expect(layout.className).toContain('lg:grid-cols-12');
    expect(screen.getByTestId('main')).toBeDefined();
    expect(screen.getByTestId('sidebar')).toBeDefined();
  });

  it('StickySidebar applies sticky positioning', () => {
    render(
      <StickySidebar data-testid="sidebar">
        <div>content</div>
      </StickySidebar>,
    );
    const el = screen.getByTestId('sidebar');
    expect(el.className).toContain('sticky');
    expect(el.className).toContain('top-[120px]');
  });

  it('EditorialSection renders an anchor-friendly section', () => {
    render(
      <EditorialSection data-testid="section" title="Acceptance">
        <p>content</p>
      </EditorialSection>,
    );
    const el = screen.getByTestId('section');
    expect(el.tagName).toBe('SECTION');
    expect(el.id).toBe('acceptance');
    expect(screen.getByRole('heading', { name: 'Acceptance' })).toBeDefined();
  });

  it('InfoCallout renders variant tokens', () => {
    render(
      <InfoCallout data-testid="callout" variant="warning" title="Action required">
        Update your tax info.
      </InfoCallout>,
    );
    const el = screen.getByTestId('callout');
    expect(el.className).toContain('border-l-status-warning');
    expect(screen.getByText('Action required')).toBeDefined();
  });
});

describe('IPS card components', () => {
  it('SupportCard renders title, description, and CTA link', () => {
    render(
      <SupportCard
        title="Need help?"
        description="Our team is ready."
        cta={{ label: 'Contact support', href: '/contact' }}
      />,
    );
    expect(screen.getByText('Need help?')).toBeDefined();
    expect(screen.getByText('Our team is ready.')).toBeDefined();
    expect(screen.getByRole('link', { name: 'Contact support' })).toBeDefined();
  });

  it('RelatedLinksCard renders related page links', () => {
    render(
      <RelatedLinksCard
        links={[
          { label: 'Privacy', href: '/privacy' },
          { label: 'Terms', href: '/terms' },
        ]}
      />,
    );
    expect(screen.getByRole('link', { name: 'Privacy' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Terms' })).toBeDefined();
  });

  it('ContactMethodCard renders value and CTA', () => {
    render(
      <ContactMethodCard
        icon={<span data-testid="icon">*</span>}
        title="Email"
        value="support@partspeddle.com"
        description="Response within one business day."
        cta={{ label: 'Send email', href: 'mailto:support@partspeddle.com' }}
      />,
    );
    expect(screen.getByText('support@partspeddle.com')).toBeDefined();
    expect(screen.getByRole('link', { name: 'Send email' })).toBeDefined();
  });

  it('NetworkStatisticCard renders metric and description', () => {
    render(<NetworkStatisticCard metric="350+" description="Verified yards" />);
    expect(screen.getByText('350+')).toBeDefined();
    expect(screen.getByText('Verified yards')).toBeDefined();
  });

  it('TrustFeatureCard renders icon, title, and description', () => {
    render(
      <TrustFeatureCard
        icon={<span data-testid="icon">*</span>}
        title="Buyer Protection"
        description="Every purchase is protected."
      />,
    );
    expect(screen.getByText('Buyer Protection')).toBeDefined();
    expect(screen.getByText('Every purchase is protected.')).toBeDefined();
  });

  it('VerificationProcessTimeline renders all steps', () => {
    render(
      <VerificationProcessTimeline
        heading="How it works"
        steps={[
          { title: 'Apply', description: 'Submit details.' },
          { title: 'Verify', description: 'Get reviewed.' },
        ]}
      />,
    );
    expect(screen.getByRole('heading', { name: 'How it works' })).toBeDefined();
    expect(screen.getByText('Apply')).toBeDefined();
    expect(screen.getByText('Verify')).toBeDefined();
  });
});

describe('IPS navigation and forms', () => {
  it('TableOfContents extracts headings from EditorialSection children', () => {
    render(
      <TableOfContents>
        <EditorialSection title="Acceptance" showDivider={false}>
          <p>content</p>
        </EditorialSection>
        <EditorialSection title="Eligibility">
          <p>content</p>
        </EditorialSection>
      </TableOfContents>,
    );
    expect(screen.getByRole('link', { name: 'Acceptance' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Eligibility' })).toBeDefined();
  });

  it('ContactForm shows success state after submit', () => {
    render(<ContactForm />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'Help' } });
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'I need help.' } });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));
    expect(screen.getByText('Message sent')).toBeDefined();
  });
});

describe('IPS page refactors', () => {
  it('About page renders using IPS header and sections', () => {
    render(<AboutPage />);
    expect(screen.getByRole('heading', { name: /About PartsPeddle/i, level: 1 })).toBeDefined();
    expect(screen.getByText('Our story')).toBeDefined();
    expect(screen.getByText('2M+')).toBeDefined();
  });

  it('Contact page renders contact methods and form', () => {
    render(<ContactPage />);
    expect(screen.getByRole('heading', { name: /We're here to help./i, level: 1 })).toBeDefined();
    expect(screen.getByText('+1 (800) 555-0199')).toBeDefined();
    expect(screen.getByLabelText('Name')).toBeDefined();
  });

  it('Terms page renders TOC and legal sections', () => {
    render(<TermsPage />);
    expect(screen.getByRole('heading', { name: /Terms of Service/i, level: 1 })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Acceptance' })).toBeDefined();
    expect(screen.getByText('Limitation of Liability')).toBeDefined();
  });

  it('Privacy page renders TOC and data sections', () => {
    render(<PrivacyPage />);
    expect(screen.getByRole('heading', { name: /Privacy Policy/i, level: 1 })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Information We Collect' })).toBeDefined();
    expect(screen.getByText('Data Retention')).toBeDefined();
  });

  it('Salvage Network page renders stats, features, and timeline', () => {
    render(<SalvageNetworkPage />);
    expect(
      screen.getByRole('heading', { name: /Join the PartsPeddle Salvage Network/i, level: 1 }),
    ).toBeDefined();
    expect(screen.getByText('350+')).toBeDefined();
    expect(screen.getByText('Reach More Buyers')).toBeDefined();
    expect(screen.getByText('Apply to Join')).toBeDefined();
  });

  it('Trust Verification page renders features and metrics', () => {
    render(<TrustVerificationPage />);
    expect(screen.getByRole('heading', { name: /Trust & Verification/i, level: 1 })).toBeDefined();
    expect(screen.getByText('Identity Verification')).toBeDefined();
    expect(screen.getByText('98%')).toBeDefined();
  });
});

describe('PublicInfoPage fallback', () => {
  it('still renders as a fallback wrapper', () => {
    render(
      <PublicInfoPage title="Fallback" subtitle="Still works">
        <p>Legacy content</p>
      </PublicInfoPage>,
    );
    expect(screen.getByText('Fallback')).toBeDefined();
    expect(screen.getByText('Legacy content')).toBeDefined();
  });
});
