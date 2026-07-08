import { notFound } from 'next/navigation';
import { PublicInfoPage, publicInfoMetadata } from '@/components/layout/PublicInfoPage';

interface SellerProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SellerProfilePageProps) {
  const { id } = await params;
  return publicInfoMetadata('Seller Profile', `View seller profile on PartsPeddle.`);
}

export default async function SellerProfilePage({ params }: SellerProfilePageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return (
    <PublicInfoPage title="Seller Profile" subtitle={`Seller ID: ${id}`}>
      <p>
        This seller profile page is under construction. Soon you will be able to view the
        seller&apos;s inventory, ratings, location, and contact information here.
      </p>
    </PublicInfoPage>
  );
}
