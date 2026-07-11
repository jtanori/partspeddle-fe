import type { Meta, StoryObj } from '@storybook/react';
import { InfoCallout } from './InfoCallout';

const meta: Meta<typeof InfoCallout> = {
  component: InfoCallout,
  title: 'Information Pages/InfoCallout',
};

export default meta;

type Story = StoryObj<typeof InfoCallout>;

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Heads up',
    children: 'This is an informational callout for editorial pages.',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'All set',
    children: 'Your account has been verified and is ready to list parts.',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Action required',
    children: 'Please update your tax information before the end of the quarter.',
  },
};

export const Neutral: Story = {
  args: {
    variant: 'neutral',
    title: 'Note',
    children: 'This section is provided for general guidance only.',
  },
};
