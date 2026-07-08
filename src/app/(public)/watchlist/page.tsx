import { PublicInfoPage, publicInfoMetadata } from '@/components/layout/PublicInfoPage';

export const metadata = publicInfoMetadata(
  'Watchlist',
  'View and manage your saved parts and sellers on PartsPeddle.',
);

export default function WatchlistPage() {
  return (
    <PublicInfoPage title="Your Watchlist" subtitle="Saved parts and sellers you are following.">
      <p>
        Your watchlist is under construction. Soon you will be able to save parts and sellers and
        receive alerts when prices change or new inventory arrives.
      </p>
    </PublicInfoPage>
  );
}
