import type { Meta, StoryObj } from '@storybook/react';
import { EditorialSection } from './EditorialSection';

const meta: Meta<typeof EditorialSection> = {
  component: EditorialSection,
  title: 'Information Pages/EditorialSection',
};

export default meta;

type Story = StoryObj<typeof EditorialSection>;

export const Default: Story = {
  args: {
    title: 'Acceptance of Terms',
    description: 'By using PartsPeddle you agree to these terms.',
    children: <p>Content goes here.</p>,
  },
};

export const WithoutDivider: Story = {
  args: {
    title: 'Introduction',
    showDivider: false,
    children: <p>First section without a top border.</p>,
  },
};
