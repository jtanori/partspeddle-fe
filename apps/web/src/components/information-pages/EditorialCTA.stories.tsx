import type { Meta, StoryObj } from '@storybook/react';
import { EditorialCTA } from './EditorialCTA';

const meta: Meta<typeof EditorialCTA> = {
  component: EditorialCTA,
  title: 'Information Pages/EditorialCTA',
};

export default meta;

type Story = StoryObj<typeof EditorialCTA>;

export const Default: Story = {
  args: {},
};
