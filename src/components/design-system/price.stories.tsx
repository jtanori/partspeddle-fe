import type { Meta, StoryObj } from '@storybook/react';
import { Price } from './price';

const meta: Meta<typeof Price> = {
  component: Price,
  title: 'Design System/Price',
  argTypes: {
    size: {
      control: 'select',
      options: ['meta', 'body', 'card-title', 'section', 'hero'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Price>;

export const Default: Story = {
  args: {
    amount: 129.99,
  },
};

export const WithCompareAt: Story = {
  args: {
    amount: 129.99,
    compareAtAmount: 199.99,
    size: 'card-title',
  },
};

export const MXN: Story = {
  args: {
    amount: 1250,
    currency: 'MXN',
    size: 'section',
  },
};
