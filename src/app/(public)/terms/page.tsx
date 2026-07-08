import { PublicInfoPage, publicInfoMetadata } from '@/components/layout/PublicInfoPage';

export const metadata = publicInfoMetadata(
  'Terms of Service',
  'Read the PartsPeddle Terms of Service.',
);

export default function TermsPage() {
  return (
    <PublicInfoPage title="Terms of Service" subtitle="Last updated: July 2026">
      <p>
        Welcome to PartsPeddle. These Terms of Service govern your use of the PartsPeddle website,
        mobile applications, and services. By accessing or using PartsPeddle, you agree to these
        terms.
      </p>
      <h3 className="font-display font-bold uppercase tracking-wider text-foreground-primary mt-6 mb-2">
        1. Acceptance of Terms
      </h3>
      <p>
        By creating an account, listing parts, or making a purchase, you agree to comply with these
        Terms of Service and all applicable laws and regulations.
      </p>
      <h3 className="font-display font-bold uppercase tracking-wider text-foreground-primary mt-6 mb-2">
        2. Account Registration
      </h3>
      <p>
        You must provide accurate and complete information when registering. You are responsible for
        maintaining the confidentiality of your account credentials.
      </p>
      <h3 className="font-display font-bold uppercase tracking-wider text-foreground-primary mt-6 mb-2">
        3. Buying and Selling
      </h3>
      <p>
        Sellers must accurately describe parts, including condition, fitment, and defects. Buyers
        must review listings carefully before purchasing. All transactions are subject to our buyer
        protection and return policies.
      </p>
      <h3 className="font-display font-bold uppercase tracking-wider text-foreground-primary mt-6 mb-2">
        4. Prohibited Conduct
      </h3>
      <p>
        Users may not list counterfeit parts, engage in fraudulent transactions, harass other users,
        or use the platform for illegal activities.
      </p>
      <h3 className="font-display font-bold uppercase tracking-wider text-foreground-primary mt-6 mb-2">
        5. Changes to Terms
      </h3>
      <p>
        PartsPeddle may update these terms from time to time. Continued use of the platform after
        changes constitutes acceptance of the updated terms.
      </p>
    </PublicInfoPage>
  );
}
