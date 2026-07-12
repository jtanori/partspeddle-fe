import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './tabs';

const meta: Meta<typeof Tabs> = {
  component: Tabs,
  title: 'UI/Tabs',
};

export default meta;

type Story = StoryObj<typeof Tabs>;

const tabs = [
  { id: 'details', label: 'Details', content: 'Part details content.' },
  { id: 'fitment', label: 'Fitment', content: 'Compatible vehicles.' },
  { id: 'shipping', label: 'Shipping', content: 'Shipping options.' },
];

export const Default: Story = {
  args: {
    tabs,
  },
};

export const DisabledTab: Story = {
  args: {
    tabs: [
      { id: 'details', label: 'Details', content: 'Part details content.' },
      { id: 'reviews', label: 'Reviews', content: 'User reviews.', disabled: true },
    ],
  },
};
