import type { Meta, StoryObj } from '@storybook/react';
import { SellerCard } from './seller-card';
import { sampleSeller, sampleSellerNoLogo } from '../__fixtures__/sellers';

const meta: Meta<typeof SellerCard> = {
  component: SellerCard,
  title: 'Design System/SellerCard',
};

export default meta;

type Story = StoryObj<typeof SellerCard>;

export const Grid: Story = {
  args: {
    seller: sampleSeller,
    onViewInventory: () => {},
  },
};

export const Compact: Story = {
  args: {
    seller: sampleSellerNoLogo,
    variant: 'compact',
  },
};

export const NoLogo: Story = {
  args: {
    seller: sampleSellerNoLogo,
    onViewInventory: () => {},
  },
};
