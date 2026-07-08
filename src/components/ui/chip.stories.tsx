import type { Meta, StoryObj } from '@storybook/react';
import { Chip, FilterChip } from './chip';

const meta: Meta<typeof Chip> = {
  component: Chip,
  title: 'UI/Chip',
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'outline'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Chip>;

export const Default: Story = {
  args: {
    label: 'OEM',
  },
};

export const Primary: Story = {
  args: {
    label: 'Verified',
    variant: 'primary',
  },
};

export const Active: Story = {
  args: {
    label: 'Active',
    active: true,
  },
};

export const Filter: Story = {
  render: () => <FilterChip label="Honda" onRemove={() => {}} />,
};
