import type { Meta, StoryObj } from '@storybook/react';
import { WorkspaceLayout } from './workspace-layout';
import { Sidebar } from './sidebar';
import { TopNavigation } from './top-navigation';
import { InspectorPanel } from './inspector-panel';
import { PageHeader } from './page-header';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings } from 'lucide-react';

const meta: Meta<typeof WorkspaceLayout> = {
  component: WorkspaceLayout,
  title: 'Workspace/WorkspaceLayout',
};

export default meta;

type Story = StoryObj<typeof WorkspaceLayout>;

const sidebar = (
  <Sidebar
    logo={<span className="font-display font-black uppercase">PartsPeddle</span>}
    sections={[
      {
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '#' },
          { id: 'inventory', label: 'Inventory', icon: Package, href: '#' },
          { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '#' },
          { id: 'customers', label: 'Customers', icon: Users, href: '#' },
          { id: 'settings', label: 'Settings', icon: Settings, href: '#' },
        ],
      },
    ]}
  />
);

const topNav = <TopNavigation notifications={2} messages={1} tasks={3} />;

export const Default: Story = {
  render: () => (
    <div className="h-[600px]">
      <WorkspaceLayout sidebar={sidebar} topNav={topNav}>
        <PageHeader title="Inventory" subtitle="Manage your listings" />
        <p className="mt-4 text-foreground-secondary">Workspace content goes here.</p>
      </WorkspaceLayout>
    </div>
  ),
};

export const WithInspector: Story = {
  render: () => (
    <div className="h-[600px]">
      <WorkspaceLayout
        sidebar={sidebar}
        topNav={topNav}
        inspector={<InspectorPanel title="Details">Inspector content</InspectorPanel>}
      >
        <PageHeader title="Listing Details" />
        <p className="mt-4 text-foreground-secondary">Main content with inspector panel.</p>
      </WorkspaceLayout>
    </div>
  ),
};
