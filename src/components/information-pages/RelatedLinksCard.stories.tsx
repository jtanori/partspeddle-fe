import type { Meta, StoryObj } from '@storybook/react';
import { RelatedLinksCard } from './RelatedLinksCard';

const meta: Meta<typeof RelatedLinksCard> = {
  component: RelatedLinksCard,
  title: 'Information Pages/RelatedLinksCard',
};

export default meta;

type Story = StoryObj<typeof RelatedLinksCard>;

export const Default: Story = {
  args: {
    links: [
      { label: 'Privacy Policy', href: '/privacy', description: 'How we handle your data.' },
      { label: 'Terms of Service', href: '/terms', description: 'The rules of the marketplace.' },
      { label: 'Trust & Verification', href: '/trust-verification' },
    ],
  },
};
