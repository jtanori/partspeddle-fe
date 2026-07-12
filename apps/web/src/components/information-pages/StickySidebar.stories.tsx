import type { Meta, StoryObj } from '@storybook/react';
import { StickySidebar } from './StickySidebar';
import { Card } from '@/components/ui/card';

const meta: Meta<typeof StickySidebar> = {
  component: StickySidebar,
  title: 'Information Pages/StickySidebar',
};

export default meta;

type Story = StoryObj<typeof StickySidebar>;

export const Default: Story = {
  render: () => (
    <StickySidebar className="max-w-sm">
      <Card className="p-5">
        <p className="text-foreground-secondary">First sticky card</p>
      </Card>
      <Card className="p-5">
        <p className="text-foreground-secondary">Second sticky card</p>
      </Card>
    </StickySidebar>
  ),
};
