import type { Meta, StoryObj } from '@storybook/react';
import { InformationLayout } from './InformationLayout';
import { Card } from '@/components/ui/card';

const meta: Meta<typeof InformationLayout> = {
  component: InformationLayout,
  title: 'Information Pages/InformationLayout',
};

export default meta;

type Story = StoryObj<typeof InformationLayout>;

export const Default: Story = {
  args: {
    main: (
      <Card className="h-64 p-5">
        <p className="text-foreground-secondary">Main editorial content column.</p>
      </Card>
    ),
    sidebar: (
      <Card className="h-48 p-5">
        <p className="text-foreground-secondary">Sticky sidebar column.</p>
      </Card>
    ),
  },
};
