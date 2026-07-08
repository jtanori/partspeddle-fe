import type { Meta, StoryObj } from '@storybook/react';
import { Toast } from './toast';

const meta: Meta<typeof Toast> = {
  component: Toast,
  title: 'UI/Toast',
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'error', 'info', 'warning'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Toast>;

export const Success: Story = {
  args: {
    message: 'Listing saved successfully.',
    variant: 'success',
  },
};

export const Error: Story = {
  args: {
    message: 'Failed to publish listing.',
    variant: 'error',
  },
};

export const Warning: Story = {
  args: {
    message: 'Inventory is running low.',
    variant: 'warning',
  },
};

export const Info: Story = {
  args: {
    message: 'New message from buyer.',
    variant: 'info',
  },
};
