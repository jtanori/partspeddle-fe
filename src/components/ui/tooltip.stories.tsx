import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from './tooltip';

const meta: Meta<typeof Tooltip> = {
  component: Tooltip,
  title: 'UI/Tooltip',
};

export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    content: 'Tooltip content',
    children: <span className="underline decoration-dashed">Hover me</span>,
  },
};
