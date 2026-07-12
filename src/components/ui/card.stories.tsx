import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardSecondary, CardFloating } from './card';

const meta: Meta<typeof Card> = {
  component: Card,
  title: 'UI/Card',
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Primary: Story = {
  args: {
    children: <p className="text-foreground-secondary">Primary card content.</p>,
  },
};

export const Secondary: Story = {
  render: () => (
    <CardSecondary>
      <p className="text-foreground-secondary">Secondary card content.</p>
    </CardSecondary>
  ),
};

export const Floating: Story = {
  render: () => (
    <CardFloating>
      <p className="text-foreground-secondary">Floating action card content.</p>
    </CardFloating>
  ),
};
