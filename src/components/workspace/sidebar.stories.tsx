import type { Meta, StoryObj } from '@storybook/react';
import { Sidebar } from './sidebar';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, ChevronDown } from 'lucide-react';

const meta: Meta<typeof Sidebar> = {
  component: Sidebar,
  title: 'Workspace/Sidebar',
};

export default meta;

type Story = StoryObj<typeof Sidebar>;

const sections = [
  {
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '#' },
      {
        id: 'inventory',
        label: 'Inventory',
        icon: Package,
        children: [
          { id: 'listings', label: 'Listings', href: '#' },
          { id: 'drafts', label: 'Drafts', href: '#' },
        ],
      },
      { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '#' },
      { id: 'customers', label: 'Customers', icon: Users, href: '#' },
      { id: 'settings', label: 'Settings', icon: Settings, href: '#' },
    ],
  },
];

export const Default: Story = {
  args: {
    logo: <span className="font-display font-black uppercase">PartsPeddle</span>,
    sections,
  },
};

export const Collapsed: Story = {
  args: {
    logo: <span className="font-display font-black uppercase">PP</span>,
    sections,
    collapsed: true,
  },
};
