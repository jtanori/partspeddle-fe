import { PublicInfoPage, publicInfoMetadata } from '@/components/layout/PublicInfoPage';

export const metadata = publicInfoMetadata(
  'Trust & Verification',
  'Learn how PartsPeddle verifies sellers and protects buyers.',
);

export default function TrustVerificationPage() {
  return (
    <PublicInfoPage
      title="Trust & Verification"
      subtitle="How we keep the marketplace safe for buyers and sellers."
    >
      <p>
        Trust is the foundation of PartsPeddle. Every seller in our network goes through a
        verification process designed to protect buyers and maintain marketplace integrity.
      </p>
      <h3 className="font-display font-bold uppercase tracking-wider text-foreground-primary mt-6 mb-2">
        Seller Verification
      </h3>
      <p>
        Sellers provide valid business information, identity verification, and proof of inventory
        source. Our team reviews every application before a seller can list parts.
      </p>
      <h3 className="font-display font-bold uppercase tracking-wider text-foreground-primary mt-6 mb-2">
        Part Inspection
      </h3>
      <p>
        Listed parts include clear condition grades, mileage when applicable, and fitment details.
        Sellers are expected to disclose defects and stand behind their listings.
      </p>
      <h3 className="font-display font-bold uppercase tracking-wider text-foreground-primary mt-6 mb-2">
        Buyer Protection
      </h3>
      <p>
        PartsPeddle offers secure checkout, 30-day returns, and direct seller communication. If a
        part does not match the listing, our support team is here to help resolve the issue.
      </p>
    </PublicInfoPage>
  );
}
