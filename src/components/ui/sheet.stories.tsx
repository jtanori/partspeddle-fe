import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from './button';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from './sheet';

const meta: Meta<typeof Sheet> = {
  component: Sheet,
  title: 'UI/Sheet',
};

export default meta;

type Story = StoryObj<typeof Sheet>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Sheet</Button>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right">
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet description goes here.</SheetDescription>
            <p className="mt-4 text-foreground-secondary">Additional sheet content.</p>
          </SheetContent>
        </Sheet>
      </>
    );
  },
};
