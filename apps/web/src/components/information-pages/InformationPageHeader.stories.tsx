import type { Meta, StoryObj } from '@storybook/react';
import { InformationPageHeader } from './InformationPageHeader';

const meta: Meta<typeof InformationPageHeader> = {
  component: InformationPageHeader,
  title: 'Information Pages/InformationPageHeader',
};

export default meta;

type Story = StoryObj<typeof InformationPageHeader>;

export const Default: Story = {
  args: {
    eyebrow: 'SUPPORT',
    title: "We're here to help.",
    description:
      'Have a question about an order, listing, seller account, or partnership? Our team is ready to connect you with the right people.',
  },
};
