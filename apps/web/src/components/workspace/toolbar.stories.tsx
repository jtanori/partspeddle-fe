import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';
import { Toolbar } from './toolbar';

const meta: Meta<typeof Toolbar> = {
  component: Toolbar,
  title: 'Workspace/Toolbar',
};

export default meta;

type Story = StoryObj<typeof Toolbar>;

export const Default: Story = {
  render: () => (
    <Toolbar>
      <Button size="sm">Add Listing</Button>
      <Button variant="outline" size="sm">
        Filter
      </Button>
      <Button variant="ghost" size="sm">
        Sort
      </Button>
    </Toolbar>
  ),
};
