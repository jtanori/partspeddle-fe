import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DensityProvider, useDensity } from './density-provider';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof DensityProvider> = {
  component: DensityProvider,
  title: 'Workspace/DensityProvider',
};

export default meta;

type Story = StoryObj<typeof DensityProvider>;

function DensityDemo() {
  const { density, setDensity } = useDensity();
  return (
    <div className="space-y-4 p-4">
      <p className="text-foreground-secondary">Current density: {density}</p>
      <div className="flex gap-2">
        {(['comfortable', 'compact', 'dense'] as const).map((d) => (
          <Button key={d} variant={density === d ? 'default' : 'outline'} onClick={() => setDensity(d)}>
            {d}
          </Button>
        ))}
      </div>
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <DensityProvider defaultDensity="compact">
      <DensityDemo />
    </DensityProvider>
  ),
};
