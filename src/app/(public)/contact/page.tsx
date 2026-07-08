import { PublicInfoPage, publicInfoMetadata } from '@/components/layout/PublicInfoPage';

export const metadata = publicInfoMetadata(
  'Contact Us',
  'Get in touch with PartsPeddle support, sales, and seller services.',
);

export default function ContactPage() {
  return (
    <PublicInfoPage
      title="Contact Us"
      subtitle="We are here to help with orders, listings, and partnerships."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-display font-bold uppercase tracking-wider text-foreground-primary">
            Contact Methods
          </h3>
          <p>
            <strong>Email:</strong>{' '}
            <a href="mailto:support@partspeddle.com" className="text-brand-primary hover:underline">
              support@partspeddle.com
            </a>
          </p>
          <p>
            <strong>USA Phone:</strong>{' '}
            <a href="tel:+18005550199" className="text-brand-primary hover:underline">
              +1 (800) 555-0199
            </a>
          </p>
          <p>
            <strong>Mexico Phone:</strong>{' '}
            <a href="tel:+52555550199" className="text-brand-primary hover:underline">
              +52 (55) 5550-1999
            </a>
          </p>
          <p>
            <strong>Physical Address:</strong>
            <br />
            PartsPeddle Headquarters
            <br />
            123 Industrial Blvd, Suite 400
            <br />
            Charlotte, NC 28206, USA
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="font-display font-bold uppercase tracking-wider text-foreground-primary">
            Social Networks
          </h3>
          <ul className="space-y-2">
            <li>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary hover:underline"
              >
                Facebook
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary hover:underline"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary hover:underline"
              >
                YouTube
              </a>
            </li>
          </ul>
          <p className="text-xs text-foreground-muted">
            For order inquiries, please include your order number. For seller support, include your
            registered business name.
          </p>
        </div>
      </div>
    </PublicInfoPage>
  );
}
