import type { Meta, StoryObj } from '@storybook/react';
import { NetworkStatisticCard } from './NetworkStatisticCard';

const meta: Meta<typeof NetworkStatisticCard> = {
  component: NetworkStatisticCard,
  title: 'Information Pages/NetworkStatisticCard',
};

export default meta;

type Story = StoryObj<typeof NetworkStatisticCard>;

export const Default: Story = {
  args: {
    metric: '350+',
    description: 'Verified salvage yards',
  },
};
