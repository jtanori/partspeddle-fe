import { PublicInfoPage, publicInfoMetadata } from '@/components/layout/PublicInfoPage';

export const metadata = publicInfoMetadata(
  'Salvage Network',
  'Join the PartsPeddle Salvage Network of verified dismantlers and independent sellers.',
);

export default function SalvageNetworkPage() {
  return (
    <PublicInfoPage
      title="Salvage Network"
      subtitle="Verified dismantlers and independent sellers working together."
    >
      <p>
        The PartsPeddle Salvage Network is a registry of trusted dismantlers, salvage yards, and
        independent sellers who list inspected, quality used OEM parts.
      </p>
      <p>
        Network members commit to accurate fitment data, clear part descriptions, and honest
        grading. Buyers can shop with confidence knowing that every seller has been vetted through
        our trust and verification process.
      </p>
      <p>
        Are you a salvage yard or independent seller? Join the network to reach thousands of buyers,
        list inventory for free, and grow your business with PartsPeddle.
      </p>
    </PublicInfoPage>
  );
}
