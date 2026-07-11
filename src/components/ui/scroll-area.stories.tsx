import type { Meta, StoryObj } from '@storybook/react';
import { ScrollArea } from './scroll-area';

const meta: Meta<typeof ScrollArea> = {
  component: ScrollArea,
  title: 'UI/ScrollArea',
};

export default meta;

type Story = StoryObj<typeof ScrollArea>;

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-48 w-64 rounded border border-stroke-subtle p-4">
      {Array.from({ length: 30 }).map((_, i) => (
        <p key={i} className="py-1 text-sm text-foreground-secondary">
          Scrollable item {i + 1}
        </p>
      ))}
    </ScrollArea>
  ),
};
