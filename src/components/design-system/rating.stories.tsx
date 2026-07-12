import type { Meta, StoryObj } from '@storybook/react';
import { Rating } from './rating';

const meta: Meta<typeof Rating> = {
  component: Rating,
  title: 'Design System/Rating',
};

export default meta;

type Story = StoryObj<typeof Rating>;

export const Default: Story = {
  args: {
    value: 4.7,
    count: 128,
  },
};

export const NoCount: Story = {
  args: {
    value: 3.5,
  },
};

export const Zero: Story = {
  args: {
    value: 0,
    count: 0,
  },
};
