import type { Meta, StoryObj } from '@storybook/react';
import { ShieldCheck } from 'lucide-react';
import { TrustFeatureCard } from './TrustFeatureCard';

const meta: Meta<typeof TrustFeatureCard> = {
  component: TrustFeatureCard,
  title: 'Information Pages/TrustFeatureCard',
};

export default meta;

type Story = StoryObj<typeof TrustFeatureCard>;

export const Default: Story = {
  args: {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: 'Buyer Protection',
    description: 'Every purchase is backed by secure checkout and dispute resolution.',
  },
};
