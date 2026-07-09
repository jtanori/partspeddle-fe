import { publicInfoMetadata } from '@/components/layout/PublicInfoPage';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Content } from '@/components/layout/design-system/Content';
import { Section } from '@/components/layout/design-system/Section';
import { Accordion } from '@/components/ui/accordion';
import {
  InformationPageHeader,
  TrustFeatureCard,
  VerificationProcessTimeline,
  NetworkStatisticCard,
  EditorialCTA,
} from '@/components/information-pages';
import {
  UserCheck,
  Building2,
  ShieldAlert,
  Star,
  ShieldCheck,
  CreditCard,
  PackageCheck,
  Rocket,
} from 'lucide-react';

export const metadata = publicInfoMetadata(
  'Trust & Verification',
  'Learn how PartsPeddle verifies sellers and protects buyers.',
);

const trustFeatures = [
  {
    icon: <UserCheck className="h-5 w-5" />,
    title: 'Identity Verification',
    description: 'Every seller confirms their identity before they can list parts.',
  },
  {
    icon: <Building2 className="h-5 w-5" />,
    title: 'Business Validation',
    description: 'We review business licenses, tax information, and operating status.',
  },
  {
    icon: <ShieldAlert className="h-5 w-5" />,
    title: 'Fraud Monitoring',
    description: 'Automated and human review watch for suspicious behavior and listings.',
  },
  {
    icon: <Star className="h-5 w-5" />,
    title: 'Marketplace Reviews',
    description: 'Buyer feedback holds sellers accountable and helps you shop with confidence.',
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: 'Buyer Protection',
    description: 'Secure checkout, dispute resolution, and return policies protect every purchase.',
  },
  {
    icon: <CreditCard className="h-5 w-5" />,
    title: 'Secure Payments',
    description: 'Payments are processed through trusted providers and held until delivery.',
  },
];

const verificationSteps = [
  {
    icon: <UserCheck className="h-5 w-5" />,
    title: 'Identity Review',
    description: 'Government-issued ID and personal information are verified.',
  },
  {
    icon: <Building2 className="h-5 w-5" />,
    title: 'Business Verification',
    description: 'Licenses, tax records, and business address are confirmed.',
  },
  {
    icon: <PackageCheck className="h-5 w-5" />,
    title: 'Inventory Review',
    description: 'Sample listings are inspected for quality, accuracy, and fitment.',
  },
  {
    icon: <Rocket className="h-5 w-5" />,
    title: 'Activation',
    description: 'Approved sellers can list and transact on PartsPeddle.',
  },
];

const faqItems = [
  {
    id: 'why-verify',
    title: 'Why does PartsPeddle verify sellers?',
    content:
      'Verification creates accountability. Buyers know they are dealing with real businesses, and sellers build trust that leads to more sales.',
  },
  {
    id: 'buyer-protection',
    title: 'What happens if a part does not match the listing?',
    content:
      'Buyers can open a dispute within the return window. Our support team will review the case and work with both parties toward a resolution.',
  },
  {
    id: 'become-verified',
    title: 'How do I become a verified seller?',
    content:
      'Start by applying to the Salvage Network. Submit your business information, identity documents, and sample inventory for review.',
  },
  {
    id: 'payment-security',
    title: 'Are my payment details secure?',
    content:
      'Yes. PartsPeddle uses PCI-compliant payment processors. We never store full payment card details on our servers.',
  },
];

export default function TrustVerificationPage() {
  return (
    <>
      <Content>
        <Breadcrumb
          items={[{ label: 'Home', href: '/' }, { label: 'Trust & Verification' }]}
          className="py-6"
        />
        <InformationPageHeader
          eyebrow="Trust"
          title="Trust & Verification"
          description="How we keep the marketplace safe for buyers and sellers."
        />
      </Content>

      <Section spacing="lg" className="bg-surface-secondary">
        <Content>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trustFeatures.map((feature) => (
              <TrustFeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>

          <VerificationProcessTimeline
            className="mt-10"
            heading="The verification process"
            description="Every seller in our network goes through the same transparent review."
            steps={verificationSteps}
          />

          <div className="mt-10">
            <h2 className="font-display text-section font-bold uppercase tracking-tight text-foreground-primary">
              Trust by the numbers
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <NetworkStatisticCard metric="350+" description="Verified sellers" />
              <NetworkStatisticCard metric="98%" description="Buyer satisfaction" />
              <NetworkStatisticCard metric="24/7" description="Fraud monitoring" />
              <NetworkStatisticCard metric="&lt;4hrs" description="Avg. response time" />
            </div>
          </div>

          <div className="mt-12">
            <h2 className="mb-6 font-display text-section font-bold uppercase tracking-tight text-foreground-primary">
              Frequently asked questions
            </h2>
            <Accordion items={faqItems} />
          </div>
        </Content>
      </Section>

      <EditorialCTA />
    </>
  );
}
