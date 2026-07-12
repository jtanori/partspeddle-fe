import type { Meta, StoryObj } from '@storybook/react';
import Badge from './badge';

const meta: Meta<typeof Badge> = {
  component: Badge,
  title: 'UI/Badge',
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info', 'outline'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'In Stock',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Low Stock',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Out of Stock',
  },
};
