import { PublicInfoPage, publicInfoMetadata } from '@/components/layout/PublicInfoPage';

export const metadata = publicInfoMetadata(
  'Recently Viewed',
  'View your recently viewed parts on PartsPeddle.',
);

export default function RecentlyViewedPage() {
  return (
    <PublicInfoPage title="Recently Viewed" subtitle="Parts you have viewed recently.">
      <p>
        Your recently viewed parts page is under construction. Soon you will be able to see your
        browsing history and quickly return to parts you are interested in.
      </p>
    </PublicInfoPage>
  );
}
