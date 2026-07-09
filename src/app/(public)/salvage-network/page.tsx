import { publicInfoMetadata } from '@/components/layout/PublicInfoPage';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Content } from '@/components/layout/design-system/Content';
import { Section } from '@/components/layout/design-system/Section';
import {
  InformationPageHeader,
  NetworkStatisticCard,
  TrustFeatureCard,
  VerificationProcessTimeline,
  InfoCallout,
  EditorialCTA,
} from '@/components/information-pages';
import {
  Users,
  Truck,
  LayoutDashboard,
  PackageSearch,
  Globe,
  BarChart3,
  FileCheck,
  Building2,
  MapPin,
} from 'lucide-react';

export const metadata = publicInfoMetadata(
  'Salvage Network',
  'Join the PartsPeddle Salvage Network of verified dismantlers and independent sellers.',
);

const networkSteps = [
  {
    icon: <FileCheck className="h-5 w-5" />,
    title: 'Apply to Join',
    description: 'Submit your business details and verification documents.',
  },
  {
    icon: <Building2 className="h-5 w-5" />,
    title: 'Get Verified',
    description: 'We review licenses, tax status, and inventory quality.',
  },
  {
    icon: <PackageSearch className="h-5 w-5" />,
    title: 'Sync Inventory',
    description: 'List parts through our dashboard or bulk import tools.',
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: 'Reach Buyers',
    description: 'Start selling to buyers across North America.',
  },
];

const requirements = [
  'Licensed recycler or dismantler in good standing.',
  'Completed business verification and identity review.',
  'Valid tax information on file.',
  'Inventory that meets our quality and accuracy standards.',
];

export default function SalvageNetworkPage() {
  return (
    <>
      <Content>
        <Breadcrumb
          items={[{ label: 'Home', href: '/' }, { label: 'Salvage Network' }]}
          className="py-6"
        />
        <InformationPageHeader
          eyebrow="Partner Network"
          title="Join the PartsPeddle Salvage Network"
          description="Reach more buyers, list inventory, and grow your business with verified dismantlers across North America."
        />
      </Content>

      <Section spacing="lg" className="bg-surface-secondary">
        <Content>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <NetworkStatisticCard metric="350+" description="Verified yards" />
            <NetworkStatisticCard metric="2M+" description="Parts listed" />
            <NetworkStatisticCard metric="50" description="States coverage" />
            <NetworkStatisticCard metric="100%" description="Buyer protection" />
          </div>

          <div className="mt-12">
            <h2 className="font-display text-section font-bold uppercase tracking-tight text-foreground-primary">
              Why join the network
            </h2>
            <p className="mt-3 max-w-3xl font-sans text-body leading-relaxed text-foreground-secondary">
              Tools built for dismantlers, exposure built for growth.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <TrustFeatureCard
                icon={<Users className="h-5 w-5" />}
                title="Reach More Buyers"
                description="Connect with mechanics, restorers, and farmers searching for your exact inventory."
              />
              <TrustFeatureCard
                icon={<Truck className="h-5 w-5" />}
                title="Inventory Sync"
                description="Add listings one at a time or import thousands through our bulk tools."
              />
              <TrustFeatureCard
                icon={<LayoutDashboard className="h-5 w-5" />}
                title="Business Dashboard"
                description="Manage orders, messages, returns, and performance from one place."
              />
              <TrustFeatureCard
                icon={<PackageSearch className="h-5 w-5" />}
                title="Shipping Tools"
                description="Calculate costs, print labels, and keep buyers informed every step of the way."
              />
              <TrustFeatureCard
                icon={<Globe className="h-5 w-5" />}
                title="Marketplace Exposure"
                description="Your listings appear in search, related parts, and targeted buyer alerts."
              />
              <TrustFeatureCard
                icon={<BarChart3 className="h-5 w-5" />}
                title="Analytics"
                description="Track views, conversion, and buyer demand to price and stock smarter."
              />
            </div>
          </div>

          <VerificationProcessTimeline
            className="mt-8"
            heading="How the network works"
            description="A straightforward path from application to your first sale."
            steps={networkSteps}
          />

          <div className="mt-10">
            <InfoCallout variant="info" title="Network requirements">
              <ul className="list-disc space-y-1 pl-5">
                {requirements.map((req) => (
                  <li key={req}>{req}</li>
                ))}
              </ul>
            </InfoCallout>
          </div>

          <div className="mt-10">
            <h2 className="font-display text-section font-bold uppercase tracking-tight text-foreground-primary">
              Where our network reaches
            </h2>
            <div className="mt-4 flex h-64 items-center justify-center rounded-xl border border-dashed border-stroke-strong bg-surface-primary text-foreground-muted">
              <div className="text-center">
                <MapPin className="mx-auto h-8 w-8 text-brand-primary" />
                <p className="mt-2 font-sans text-body">Interactive map coming soon</p>
              </div>
            </div>
          </div>
        </Content>
      </Section>

      <EditorialCTA />
    </>
  );
}
