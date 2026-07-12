import { notFound } from 'next/navigation';
import { PublicInfoPage, publicInfoMetadata } from '@/components/layout/PublicInfoPage';

interface CompatibleVehiclesPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CompatibleVehiclesPageProps) {
  const { id } = await params;
  return publicInfoMetadata(
    'Compatible Vehicles',
    `View all vehicles compatible with this part on PartsPeddle.`,
  );
}

export default async function CompatibleVehiclesPage({ params }: CompatibleVehiclesPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return (
    <PublicInfoPage title="Compatible Vehicles" subtitle={`Part ID: ${id}`}>
      <p>
        This page will display the complete list of vehicles compatible with this part, including
        year, make, model, and engine details.
      </p>
    </PublicInfoPage>
  );
}
