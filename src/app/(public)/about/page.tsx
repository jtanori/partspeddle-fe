import { publicInfoMetadata } from '@/components/layout/PublicInfoPage';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Content } from '@/components/layout/design-system/Content';
import { Section } from '@/components/layout/design-system/Section';
import {
  InformationPageHeader,
  EditorialSection,
  NetworkStatisticCard,
  EditorialCTA,
} from '@/components/information-pages';

export const metadata = publicInfoMetadata(
  'About PartsPeddle',
  'Learn about PartsPeddle, the professional marketplace for quality used OEM auto and farm parts.',
);

export default function AboutPage() {
  return (
    <>
      <Content>
        <Breadcrumb
          items={[{ label: 'Home', href: '/' }, { label: 'About' }]}
          className="py-6"
        />
        <InformationPageHeader
          eyebrow="Company"
          title="About PartsPeddle"
          description="Real parts. Real people. Real reliability. We connect mechanics, enthusiasts, farmers, salvage yards, and independent sellers so they can trade with trust."
        />
      </Content>

      <Section spacing="lg" className="bg-surface-secondary">
        <Content>
          <div className="max-w-3xl">
            <EditorialSection title="Our story" showDivider={false}>
              <p>
                PartsPeddle was built for the people who keep machines running: mechanics restoring
                classics, farmers repairing combines, dismantlers with quality inventory, and
                buyers tired of guessing what shows up at the door.
              </p>
              <p className="mt-4">
                We started with a simple idea: make hard-to-find OEM parts easy to locate, compare,
                and buy from verified sellers. Today, PartsPeddle is a professional marketplace for
                used auto and farm parts, designed around transparency, accurate fitment, and
                trustworthy transactions.
              </p>
            </EditorialSection>

            <EditorialSection title="What we do">
              <p>
                Every part listed on PartsPeddle is backed by a real seller who has been through our
                verification process. We provide the tools sellers need to describe condition,
                document fitment, and manage orders, while giving buyers clear information, secure
                checkout, and direct communication.
              </p>
            </EditorialSection>

            <EditorialSection title="Why PartsPeddle">
              <p>
                We do not believe in mystery listings or anonymous sellers. Our marketplace is built
                on verified identities, honest part grading, and buyer protections that keep both
                sides accountable. When you buy or sell on PartsPeddle, you know who you are working
                with.
              </p>
            </EditorialSection>

            <EditorialSection title="Our mission">
              <p>
                Keep equipment working. Whether it is a daily driver, a project car, or the tractor
                that keeps a farm running, PartsPeddle makes the right part findable, affordable,
                and reliable.
              </p>
            </EditorialSection>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            <NetworkStatisticCard metric="2M+" description="Parts listed" />
            <NetworkStatisticCard metric="350+" description="Verified sellers" />
            <NetworkStatisticCard metric="50" description="States covered" />
            <NetworkStatisticCard metric="24hr" description="Typical response" />
          </div>
        </Content>
      </Section>

      <EditorialCTA />
    </>
  );
}
