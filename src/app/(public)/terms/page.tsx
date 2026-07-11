import { publicInfoMetadata } from '@/components/layout/PublicInfoPage';
import {
  DocumentationLayout,
  EditorialSection,
  TableOfContents,
  SupportCard,
  RelatedLinksCard,
  InfoCallout,
} from '@/components/information-pages';
import { HelpCircle } from 'lucide-react';

export const metadata = publicInfoMetadata(
  'Terms of Service',
  'Read the PartsPeddle Terms of Service.',
);

const sectionNodes = (
  <>
    <EditorialSection title="Acceptance" showDivider={false}>
      <p>
        Welcome to PartsPeddle. These Terms of Service govern your access to and use of the
        PartsPeddle website, mobile applications, and related services. By creating an account,
        listing parts, making a purchase, or otherwise using the platform, you agree to be bound by
        these terms and all applicable laws and regulations.
      </p>
    </EditorialSection>

    <EditorialSection title="Eligibility">
      <p>
        You must be at least 18 years old and able to enter into a binding contract to use
        PartsPeddle. Businesses must provide accurate legal business information and maintain any
        licenses required to operate in their jurisdiction.
      </p>
    </EditorialSection>

    <EditorialSection title="User Accounts">
      <p>
        You are responsible for maintaining the confidentiality of your account credentials and for
        all activity that occurs under your account. You must provide accurate, current, and
        complete information during registration and keep that information up to date.
      </p>
    </EditorialSection>

    <EditorialSection title="Listings">
      <p>
        Sellers must accurately describe each part, including condition, fitment, mileage when
        applicable, defects, and photographs. Misleading titles, incorrect fitment data, and stock
        photos that do not represent the actual item are prohibited.
      </p>
    </EditorialSection>

    <EditorialSection title="Marketplace Transactions">
      <p>
        PartsPeddle provides a venue for buyers and sellers to connect. Sellers are responsible for
        fulfilling orders, communicating shipping details, and honoring their return policies.
        Buyers are responsible for reviewing listings, asking questions before purchase, and
        completing payment.
      </p>
    </EditorialSection>

    <EditorialSection title="Payments">
      <p>
        Payments are processed through PartsPeddle’s integrated payment provider. Funds are
        typically released to sellers after the buyer confirms receipt or after a defined inspection
        period. Chargebacks and payment disputes are handled according to our policies and the
        payment provider’s terms.
      </p>
    </EditorialSection>

    <EditorialSection title="Shipping">
      <p>
        Sellers must ship items within the handling time stated in the listing and provide valid
        tracking information. Buyers should inspect packages on delivery and report shipping damage
        promptly. Shipping costs and methods must be clearly disclosed before checkout.
      </p>
    </EditorialSection>

    <EditorialSection title="Returns">
      <p>
        Return policies are set by individual sellers and must comply with PartsPeddle’s minimum
        buyer protection standards. If a part does not match the listing description, the buyer is
        generally entitled to a return or refund. Buyers must initiate return requests within the
        return window specified by the seller.
      </p>
    </EditorialSection>

    <EditorialSection title="Intellectual Property">
      <p>
        All content, trademarks, logos, and software on PartsPeddle are the property of PartsPeddle
        or its licensors. You may not copy, modify, distribute, or create derivative works from our
        platform content without express written permission.
      </p>
    </EditorialSection>

    <EditorialSection title="Prohibited Conduct">
      <p>
        You may not list counterfeit or stolen parts, engage in fraudulent transactions, harass
        other users, manipulate reviews, circumvent fees, or use the platform for any illegal
        purpose. We reserve the right to remove content and suspend accounts that violate these
        rules.
      </p>
    </EditorialSection>

    <EditorialSection title="Account Suspension">
      <p>
        PartsPeddle may suspend or terminate accounts that violate these terms, pose a fraud risk,
        or harm the marketplace. Suspended users may appeal enforcement decisions by contacting our
        trust and safety team.
      </p>
    </EditorialSection>

    <EditorialSection title="Disclaimer">
      <p>
        PartsPeddle is provided on an “as is” and “as available” basis. We do not guarantee
        uninterrupted access, the accuracy of seller-provided information, or the outcome of any
        transaction. Users transact at their own risk within the protections provided by these terms
        and our buyer protection policies.
      </p>
    </EditorialSection>

    <EditorialSection title="Limitation of Liability">
      <p>
        To the extent permitted by law, PartsPeddle shall not be liable for indirect, incidental,
        consequential, or punitive damages arising out of your use of the platform. Our total
        liability for any claim arising from these terms is limited to the fees paid by you to
        PartsPeddle in the twelve months preceding the claim.
      </p>
    </EditorialSection>

    <EditorialSection title="Changes">
      <p>
        PartsPeddle may update these terms from time to time. We will notify users of material
        changes by email or through the platform. Continued use of the platform after changes take
        effect constitutes acceptance of the updated terms.
      </p>
    </EditorialSection>

    <EditorialSection title="Contact">
      <p>
        Questions about these terms can be sent to our legal team at{' '}
        <a href="mailto:legal@partspeddle.com" className="text-brand-primary hover:underline">
          legal@partspeddle.com
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

export default function TermsPage() {
  return (
    <DocumentationLayout
      eyebrow="Legal"
      title="Terms of Service"
      description="Last updated: July 2026"
      breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Terms of Service' }]}
      main={
        <>
          <InfoCallout className="mb-8" title="Legal notice">
            This page describes the rules that apply to your use of PartsPeddle. Please read it
            carefully. If you do not agree, you may not use the platform.
          </InfoCallout>
          {sectionNodes}
        </>
      }
      sidebar={
        <>
          <TableOfContents>{sectionNodes}</TableOfContents>
          <SupportCard
            icon={<HelpCircle className="h-6 w-6" />}
            title="Questions about these terms?"
            description="Our support team can help clarify policies and answer account questions."
            cta={{ label: 'Contact support', href: '/contact' }}
          />
          <RelatedLinksCard
            title="Related pages"
            links={[
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Trust & Verification', href: '/trust-verification' },
              { label: 'Salvage Network', href: '/salvage-network' },
            ]}
          />
        </>
      }
    />
  );
}
