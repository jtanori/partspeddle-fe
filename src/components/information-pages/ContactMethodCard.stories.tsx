import type { Meta, StoryObj } from '@storybook/react';
import { Mail } from 'lucide-react';
import { ContactMethodCard } from './ContactMethodCard';

const meta: Meta<typeof ContactMethodCard> = {
  component: ContactMethodCard,
  title: 'Information Pages/ContactMethodCard',
};

export default meta;

type Story = StoryObj<typeof ContactMethodCard>;

export const Email: Story = {
  args: {
    icon: <Mail className="h-5 w-5" />,
    title: 'Email',
    value: 'support@partspeddle.com',
    description: 'Response within one business day.',
    cta: { label: 'Send email', href: 'mailto:support@partspeddle.com' },
  },
};
