import { PublicInfoPage, publicInfoMetadata } from '@/components/layout/PublicInfoPage';

export const metadata = publicInfoMetadata(
  'Profile',
  'Manage your PartsPeddle profile and account settings.',
);

export default function ProfilePage() {
  return (
    <PublicInfoPage
      title="Your Profile"
      subtitle="Manage your account, saved vehicles, and preferences."
    >
      <p>
        Your profile page is under construction. Soon you will be able to view your account details,
        saved vehicles, recently viewed parts, and notification preferences here.
      </p>
    </PublicInfoPage>
  );
}
