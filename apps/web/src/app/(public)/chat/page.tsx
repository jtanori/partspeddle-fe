import { PublicInfoPage, publicInfoMetadata } from '@/components/layout/PublicInfoPage';

export const metadata = publicInfoMetadata(
  'Live Chat',
  'Chat with PartsPeddle support and sellers.',
);

export default function ChatPage() {
  return (
    <PublicInfoPage title="Live Chat" subtitle="Connect with support or sellers in real time.">
      <p>
        Our live chat is under construction. For immediate assistance, please email us at{' '}
        <a href="mailto:support@partspeddle.com" className="text-brand-primary hover:underline">
          support@partspeddle.com
        </a>{' '}
        or call{' '}
        <a href="tel:+18005550199" className="text-brand-primary hover:underline">
          +1 (800) 555-0199
        </a>
        .
      </p>
    </PublicInfoPage>
  );
}
