import type { Meta, StoryObj } from '@storybook/react';
import { InventoryCount } from './inventory-count';

const meta: Meta<typeof InventoryCount> = {
  component: InventoryCount,
  title: 'Design System/InventoryCount',
};

export default meta;

type Story = StoryObj<typeof InventoryCount>;

export const InStock: Story = {
  args: {
    quantity: 12,
    isAvailable: true,
  },
};

export const LowStock: Story = {
  args: {
    quantity: 2,
    isAvailable: true,
  },
};

export const OutOfStock: Story = {
  args: {
    quantity: 0,
    isAvailable: false,
  },
};
