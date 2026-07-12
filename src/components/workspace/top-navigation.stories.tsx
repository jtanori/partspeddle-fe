import type { Meta, StoryObj } from '@storybook/react';
import { TopNavigation } from './top-navigation';

const meta: Meta<typeof TopNavigation> = {
  component: TopNavigation,
  title: 'Workspace/TopNavigation',
};

export default meta;

type Story = StoryObj<typeof TopNavigation>;

export const Default: Story = {
  args: {
    notifications: 2,
    messages: 1,
    tasks: 3,
    profile: { name: 'Seller User' },
  },
};

export const EmptyState: Story = {
  args: {
    onSearch: (value) => console.log(value),
  },
};
