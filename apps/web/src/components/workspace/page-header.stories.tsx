import type { Meta, StoryObj } from '@storybook/react';
import { PageHeader } from './page-header';

const meta: Meta<typeof PageHeader> = {
  component: PageHeader,
  title: 'Workspace/PageHeader',
};

export default meta;

type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: {
    title: 'Inventory',
    subtitle: 'Manage your listings and drafts',
    breadcrumbs: [
      { label: 'Home', href: '#' },
      { label: 'Seller Workspace', href: '#' },
      { label: 'Inventory' },
    ],
    primaryAction: { label: 'Add Listing' },
    secondaryAction: { label: 'Import', variant: 'outline' },
  },
};
