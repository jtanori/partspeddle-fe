import type { Meta, StoryObj } from '@storybook/react';
import { HelpCircle } from 'lucide-react';
import { SupportCard } from './SupportCard';

const meta: Meta<typeof SupportCard> = {
  component: SupportCard,
  title: 'Information Pages/SupportCard',
};

export default meta;

type Story = StoryObj<typeof SupportCard>;

export const Default: Story = {
  args: {
    icon: <HelpCircle className="h-6 w-6" />,
    title: 'Need help?',
    description: 'Our support team is available to answer questions about orders, listings, and accounts.',
    cta: { label: 'Contact support', href: '/contact' },
  },
};
