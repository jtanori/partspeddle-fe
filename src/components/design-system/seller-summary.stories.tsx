import type { Meta, StoryObj } from '@storybook/react';
import { SellerSummary } from './seller-summary';

const meta: Meta<typeof SellerSummary> = {
  component: SellerSummary,
  title: 'Design System/SellerSummary',
};

export default meta;

type Story = StoryObj<typeof SellerSummary>;

export const Compact: Story = {
  args: {
    name: 'Desert Valley Auto',
    rating: 4.8,
    reviewCount: 420,
    location: 'Phoenix, AZ',
  },
};

export const Rich: Story = {
  args: {
    name: 'Austin Imports',
    rating: 4.2,
    reviewCount: 56,
    location: 'Austin, TX',
    variant: 'rich',
    badge: 'Top Seller',
  },
};

export const WithLogo: Story = {
  args: {
    name: 'Desert Valley Auto',
    rating: 4.8,
    reviewCount: 420,
    logoUrl: '/brake.jpg',
  },
};
