import { PublicInfoPage, publicInfoMetadata } from '@/components/layout/PublicInfoPage';

export const metadata = publicInfoMetadata(
  'Privacy Policy',
  'Read the PartsPeddle Privacy Policy.',
);

export default function PrivacyPage() {
  return (
    <PublicInfoPage title="Privacy Policy" subtitle="Last updated: July 2026">
      <p>
        PartsPeddle is committed to protecting your privacy. This Privacy Policy explains how we
        collect, use, and safeguard your personal information.
      </p>
      <h3 className="font-display font-bold uppercase tracking-wider text-foreground-primary mt-6 mb-2">
        1. Information We Collect
      </h3>
      <p>
        We collect information you provide when registering, listing parts, making purchases, or
        contacting support. This may include your name, email, phone number, address, and business
        information.
      </p>
      <h3 className="font-display font-bold uppercase tracking-wider text-foreground-primary mt-6 mb-2">
        2. How We Use Your Information
      </h3>
      <p>
        We use your information to provide and improve our services, process transactions,
        communicate with you, and ensure marketplace safety.
      </p>
      <h3 className="font-display font-bold uppercase tracking-wider text-foreground-primary mt-6 mb-2">
        3. Information Sharing
      </h3>
      <p>
        We do not sell your personal information. We may share information with service providers,
        payment processors, and when required by law.
      </p>
      <h3 className="font-display font-bold uppercase tracking-wider text-foreground-primary mt-6 mb-2">
        4. Security
      </h3>
      <p>
        We implement industry-standard security measures to protect your data. However, no method of
        transmission over the internet is completely secure.
      </p>
      <h3 className="font-display font-bold uppercase tracking-wider text-foreground-primary mt-6 mb-2">
        5. Your Choices
      </h3>
      <p>
        You can update your account information or contact us to request deletion of your personal
        data, subject to legal and operational requirements.
      </p>
    </PublicInfoPage>
  );
}
