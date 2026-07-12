import { publicInfoMetadata } from '@/components/layout/PublicInfoPage';
import {
  SupportCenterLayout,
  ContactMethodCard,
  ContactForm,
  SupportCard,
  RelatedLinksCard,
} from '@/components/information-pages';
import {
  Zap,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Briefcase,
  ShieldCheck,
  Flag,
} from 'lucide-react';

export const metadata = publicInfoMetadata(
  'Contact Us',
  'Get in touch with PartsPeddle support, sales, and seller services.',
);

const faqItems = [
  {
    id: 'response-time',
    title: 'How quickly will support respond?',
    content:
      'We aim to respond to all inquiries within one business day. Live chat is available during weekday business hours for faster help.',
  },
  {
    id: 'order-help',
    title: 'What information should I include about an order?',
    content:
      'Include your order number, the part listing title, and a brief description of the issue. Photos of any damage or fitment problems help us resolve things faster.',
  },
  {
    id: 'seller-support',
    title: 'How do I get help with my seller account?',
    content:
      'Email seller support with your registered business name and a description of your question. Our seller success team will route you to the right specialist.',
  },
  {
    id: 'partnerships',
    title: 'Who do I contact about partnerships?',
    content:
      'Use the partnerships card in the sidebar, or email partnerships@partspeddle.com with details about your business and how you would like to work together.',
  },
];

export default function ContactPage() {
  return (
    <SupportCenterLayout
      eyebrow="Support"
      title="We're here to help."
      description="Have a question about an order, listing, seller account, or partnership? Our team is ready to connect you with the right people."
      breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
      contactCards={
        <>
          <ContactMethodCard
            icon={<Zap className="h-5 w-5" />}
            title="Fast Support"
            value="support@partspeddle.com"
            description="Response within one business day."
            cta={{ label: 'Email us', href: 'mailto:support@partspeddle.com' }}
          />
          <ContactMethodCard
            icon={<Phone className="h-5 w-5" />}
            title="Phone"
            value="+1 (800) 555-0199"
            description="Mon–Fri, 8am–6pm ET."
            cta={{ label: 'Call now', href: 'tel:+18005550199' }}
          />
          <ContactMethodCard
            icon={<Mail className="h-5 w-5" />}
            title="Email"
            value="support@partspeddle.com"
            description="For order and listing questions."
            cta={{ label: 'Send email', href: 'mailto:support@partspeddle.com' }}
          />
          <ContactMethodCard
            icon={<MessageCircle className="h-5 w-5" />}
            title="Live Chat"
            value="Available weekdays"
            description="Chat with our team in real time."
            cta={{ label: 'Start chat', href: '/contact' }}
          />
        </>
      }
      main={<ContactForm />}
      sidebar={
        <>
          <SupportCard
            icon={<MapPin className="h-6 w-6" />}
            title="Mailing address"
            description="PartsPeddle Headquarters, 123 Industrial Blvd, Suite 400, Charlotte, NC 28206, USA."
            cta={{ label: 'Get directions', href: '#' }}
          />
          <SupportCard
            icon={<Briefcase className="h-6 w-6" />}
            title="Partnerships"
            description="Interested in integrating, sponsoring, or working together? Reach our partnerships team."
            cta={{ label: 'Email partnerships', href: 'mailto:partnerships@partspeddle.com' }}
          />
          <SupportCard
            icon={<ShieldCheck className="h-6 w-6" />}
            title="Trust & safety"
            description="Report fraud, suspicious listings, or verification concerns to our trust team."
            cta={{ label: 'Learn more', href: '/trust-verification' }}
          />
          <SupportCard
            icon={<Flag className="h-6 w-6" />}
            title="Report a listing"
            description="See something inaccurate or prohibited? Flag it and we will review it quickly."
            cta={{ label: 'Report listing', href: '/contact?subject=Report%20listing' }}
          />
        </>
      }
      faqItems={faqItems}
    />
  );
}
