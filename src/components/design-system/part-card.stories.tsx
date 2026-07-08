import type { Meta, StoryObj } from '@storybook/react';
import { PartCard } from './part-card';
import { samplePart, samplePartNoImage } from '../__fixtures__/parts';

const meta: Meta<typeof PartCard> = {
  component: PartCard,
  title: 'Design System/PartCard',
};

export default meta;

type Story = StoryObj<typeof PartCard>;

export const Grid: Story = {
  args: {
    part: samplePart,
  },
};

export const List: Story = {
  args: {
    part: samplePart,
    variant: 'list',
  },
};

export const NoImage: Story = {
  args: {
    part: samplePartNoImage,
  },
};

export const Favorite: Story = {
  args: {
    part: samplePart,
    isFavorite: true,
    onFavorite: () => {},
  },
};
