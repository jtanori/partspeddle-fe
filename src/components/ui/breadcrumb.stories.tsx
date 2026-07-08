import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumb } from './breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  component: Breadcrumb,
  title: 'UI/Breadcrumb',
};

export default meta;

type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Search', href: '/search' },
      { label: 'Alternators' },
    ],
  },
};
