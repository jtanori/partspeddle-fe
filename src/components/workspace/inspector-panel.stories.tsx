import type { Meta, StoryObj } from '@storybook/react';
import { InspectorPanel } from './inspector-panel';

const meta: Meta<typeof InspectorPanel> = {
  component: InspectorPanel,
  title: 'Workspace/InspectorPanel',
};

export default meta;

type Story = StoryObj<typeof InspectorPanel>;

export const Default: Story = {
  render: () => (
    <InspectorPanel title="Listing Status" onClose={() => {}}>
      <div className="space-y-3 text-sm text-foreground-secondary">
        <p>Draft 75% complete</p>
        <p>Estimated market value: $145.00</p>
        <p>Shipping estimate: $12.50</p>
      </div>
    </InspectorPanel>
  ),
};
