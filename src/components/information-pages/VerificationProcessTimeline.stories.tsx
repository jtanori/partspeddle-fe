import type { Meta, StoryObj } from '@storybook/react';
import { UserCheck, Building2, PackageCheck, Rocket } from 'lucide-react';
import { VerificationProcessTimeline } from './VerificationProcessTimeline';

const meta: Meta<typeof VerificationProcessTimeline> = {
  component: VerificationProcessTimeline,
  title: 'Information Pages/VerificationProcessTimeline',
};

export default meta;

type Story = StoryObj<typeof VerificationProcessTimeline>;

export const Default: Story = {
  args: {
    heading: 'How verification works',
    description: 'A simple, transparent process to keep the marketplace safe.',
    steps: [
      {
        icon: <UserCheck className="h-5 w-5" />,
        title: 'Identity Review',
        description: 'We confirm the identity of every seller.',
      },
      {
        icon: <Building2 className="h-5 w-5" />,
        title: 'Business Verification',
        description: 'Business licenses and tax status are reviewed.',
      },
      {
        icon: <PackageCheck className="h-5 w-5" />,
        title: 'Inventory Review',
        description: 'Sample listings are checked for quality and accuracy.',
      },
      {
        icon: <Rocket className="h-5 w-5" />,
        title: 'Activation',
        description: 'Approved sellers can start listing immediately.',
      },
    ],
  },
};
