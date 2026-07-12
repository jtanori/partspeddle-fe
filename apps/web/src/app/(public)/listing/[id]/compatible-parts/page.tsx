import { notFound } from 'next/navigation';
import { PublicInfoPage, publicInfoMetadata } from '@/components/layout/PublicInfoPage';

interface CompatiblePartsPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CompatiblePartsPageProps) {
  const { id } = await params;
  return publicInfoMetadata(
    'Compatible Parts',
    `View compatible and related parts on PartsPeddle.`,
  );
}

export default async function CompatiblePartsPage({ params }: CompatiblePartsPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return (
    <PublicInfoPage title="Compatible Parts" subtitle={`Related parts for Part ID: ${id}`}>
      <p>
        This page will display parts that are compatible with the same vehicles or frequently
        purchased together with this part.
      </p>
    </PublicInfoPage>
  );
}
