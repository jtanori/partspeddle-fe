import { PublicInfoPage, publicInfoMetadata } from '@/components/layout/PublicInfoPage';

export const metadata = publicInfoMetadata(
  'About PartsPeddle',
  'Learn about PartsPeddle, the professional marketplace for quality used OEM auto and farm parts.',
);

export default function AboutPage() {
  return (
    <PublicInfoPage title="About PartsPeddle" subtitle="Real parts. Real people. Real reliability.">
      <p>
        PartsPeddle is the professional marketplace for quality used OEM auto and farm parts. We
        connect mechanics, enthusiasts, farmers, salvage yards, and independent sellers so they can
        trade with trust.
      </p>
      <p>
        Every part listed on PartsPeddle is inspected and verified by real dismantlers and sellers.
        Our mission is to keep equipment working by making hard-to-find OEM parts accessible,
        affordable, and reliable.
      </p>
      <p>
        Whether you are restoring a classic, repairing daily equipment, or running a salvage
        operation, PartsPeddle gives you the tools and protections to buy and sell with confidence.
      </p>
    </PublicInfoPage>
  );
}
