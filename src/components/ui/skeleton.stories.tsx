import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './skeleton';

const meta: Meta<typeof Skeleton> = {
  component: Skeleton,
  title: 'UI/Skeleton',
};

export default meta;

type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  render: () => <Skeleton className="h-24 w-full" />,
};

export const PartCard: Story = {
  render: () => <Skeleton.PartCard />,
};

export const SellerCard: Story = {
  render: () => <Skeleton.SellerCard />,
};

export const TextLines: Story = {
  render: () => <Skeleton.Text lines={3} className="max-w-sm" />,
};
