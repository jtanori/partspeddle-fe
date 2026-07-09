import { publicInfoMetadata } from '@/components/layout/PublicInfoPage';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Content } from '@/components/layout/design-system/Content';
import { Section } from '@/components/layout/design-system/Section';
import {
  InformationPageHeader,
  InformationLayout,
  StickySidebar,
  EditorialSection,
  TableOfContents,
  SupportCard,
  RelatedLinksCard,
  InfoCallout,
  EditorialCTA,
} from '@/components/information-pages';
import { HelpCircle } from 'lucide-react';

export const metadata = publicInfoMetadata(
  'Privacy Policy',
  'Read the PartsPeddle Privacy Policy.',
);

const sectionNodes = (
  <>
    <EditorialSection title="Information We Collect" showDivider={false}>
      <p>
        We collect information you provide directly, information generated through your use of the
        platform, and information from third-party services that help us operate the marketplace.
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-5">
        <li>
          <strong>Account information:</strong> name, email, phone number, business name, and
          password.
        </li>
        <li>
          <strong>Vehicle information:</strong> VIN, year, make, model, and trim used to match
          parts.
        </li>
        <li>
          <strong>Listing information:</strong> photos, descriptions, pricing, and inventory data.
        </li>
        <li>
          <strong>Payment information:</strong> billing address and payment method details handled
          by our payment processor.
        </li>
        <li>
          <strong>Cookies and analytics:</strong> usage data, device information, and browsing
          behavior collected through cookies and analytics tools.
        </li>
      </ul>
    </EditorialSection>

    <EditorialSection title="How We Use Data">
      <p>
        We use your data to operate the marketplace, process transactions, communicate with you,
        improve our services, prevent fraud, and comply with legal obligations. We may also use
        aggregated or anonymized data for analytics and product development.
      </p>
    </EditorialSection>

    <EditorialSection title="Sharing">
      <p>
        We do not sell your personal information. We share data with trusted service providers such
        as payment processors, shipping carriers, cloud hosting providers, and analytics platforms.
        We may also disclose information when required by law or to protect the rights and safety of
        our users.
      </p>
    </EditorialSection>

    <EditorialSection title="Security">
      <p>
        We implement industry-standard technical and organizational measures to protect your data.
        This includes encryption in transit, access controls, and regular security reviews. No
        method of transmission over the internet is completely secure, and we cannot guarantee
        absolute security.
      </p>
    </EditorialSection>

    <EditorialSection title="Your Rights">
      <p>
        Depending on your location, you may have the right to access, correct, delete, or restrict
        the processing of your personal data. You can update most account information in your
        profile settings. For other requests, contact us using the information below.
      </p>
    </EditorialSection>

    <EditorialSection title="Data Retention">
      <p>
        We retain personal information for as long as necessary to provide our services, comply with
        legal obligations, resolve disputes, and enforce our agreements. When data is no longer
        needed, we delete or anonymize it in accordance with our retention schedule.
      </p>
    </EditorialSection>

    <EditorialSection title="Children">
      <p>
        PartsPeddle is not intended for children under 18. We do not knowingly collect personal
        information from children. If you believe a child has provided us with personal data,
        please contact us so we can delete it.
      </p>
    </EditorialSection>

    <EditorialSection title="International Users">
      <p>
        PartsPeddle operates primarily in North America. If you access the platform from outside the
        United States or Mexico, you consent to the transfer, storage, and processing of your data
        in those jurisdictions, which may have different data protection laws than your country.
      </p>
    </EditorialSection>

    <EditorialSection title="Contact">
      <p>
        For privacy-related questions or data requests, contact us at{' '}
        <a href="mailto:privacy@partspeddle.com" className="text-brand-primary hover:underline">
          privacy@partspeddle.com
        </a>{' '}
        or through our{' '}
        <a href="/contact" className="text-brand-primary hover:underline">
          contact page
        </a>
        .
      </p>
    </EditorialSection>
  </>
);

export default function PrivacyPage() {
  return (
    <>
      <Content>
        <Breadcrumb
          items={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]}
          className="py-6"
        />
        <InformationPageHeader
          eyebrow="Legal"
          title="Privacy Policy"
          description="Last updated: July 2026"
        />
      </Content>

      <Section spacing="lg" className="bg-surface-secondary">
        <Content>
          <InfoCallout className="mb-8" variant="success" title="Your privacy matters">
            PartsPeddle is committed to protecting your personal information and being transparent
            about how we use it.
          </InfoCallout>

          <InformationLayout
            main={<article>{sectionNodes}</article>}
            sidebar={
              <StickySidebar>
                <TableOfContents>{sectionNodes}</TableOfContents>
                <SupportCard
                  icon={<HelpCircle className="h-6 w-6" />}
                  title="Privacy questions?"
                  description="Contact our privacy team for data requests or policy questions."
                  cta={{ label: 'Contact support', href: '/contact' }}
                />
                <RelatedLinksCard
                  title="Related pages"
                  links={[
                    { label: 'Terms of Service', href: '/terms' },
                    { label: 'Trust & Verification', href: '/trust-verification' },
                    { label: 'Salvage Network', href: '/salvage-network' },
                  ]}
                />
              </StickySidebar>
            }
          />
        </Content>
      </Section>

      <EditorialCTA />
    </>
  );
}
