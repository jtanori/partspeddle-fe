import type { Meta, StoryObj } from '@storybook/react';
import { ImageGallery } from './image-gallery';

const meta: Meta<typeof ImageGallery> = {
  component: ImageGallery,
  title: 'Design System/ImageGallery',
};

export default meta;

type Story = StoryObj<typeof ImageGallery>;

export const Default: Story = {
  args: {
    images: ['/brake.jpg', '/brake.jpg', '/brake.jpg'],
    alt: 'OEM Brake Caliper',
  },
};

export const Empty: Story = {
  args: {
    images: [],
    alt: 'No images',
  },
};
