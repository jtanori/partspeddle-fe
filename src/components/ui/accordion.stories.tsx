import type { Meta, StoryObj } from '@storybook/react';
import { Accordion } from './accordion';

const meta: Meta<typeof Accordion> = {
  component: Accordion,
  title: 'UI/Accordion',
};

export default meta;

type Story = StoryObj<typeof Accordion>;

const items = [
  { id: 'condition', title: 'Condition', content: 'Used OEM part in excellent working order.' },
  { id: 'shipping', title: 'Shipping', content: 'Ships within 24 hours via FedEx Ground.' },
  { id: 'returns', title: 'Returns', content: '30-day hassle-free returns accepted.' },
];

export const Default: Story = {
  args: {
    items,
  },
};

export const MultipleOpen: Story = {
  args: {
    items,
    allowMultiple: true,
    defaultOpen: ['condition', 'shipping'],
  },
};
