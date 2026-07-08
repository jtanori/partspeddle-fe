import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from './button';
import { Drawer } from './drawer';

const meta: Meta<typeof Drawer> = {
  component: Drawer,
  title: 'UI/Drawer',
};

export default meta;

type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Drawer</Button>
        <Drawer open={open} onClose={() => setOpen(false)} title="Filters">
          <p className="text-foreground-secondary">Drawer content goes here.</p>
        </Drawer>
      </>
    );
  },
};
