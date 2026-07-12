import type { Meta, StoryObj } from '@storybook/react';
import { VehicleLineage } from './vehicle-lineage';

const meta: Meta<typeof VehicleLineage> = {
  component: VehicleLineage,
  title: 'Design System/VehicleLineage',
};

export default meta;

type Story = StoryObj<typeof VehicleLineage>;

const vehicles = [
  { year: 2020, make: 'Honda', model: 'Civic', engine: '2.0L' },
  { year: 2019, make: 'Honda', model: 'Civic', engine: '1.5L' },
  { year: 2021, make: 'Honda', model: 'Civic', engine: '2.0L' },
];

export const Default: Story = {
  args: {
    vehicles,
    totalCount: 12,
    onViewAll: () => {},
  },
};

export const CompactList: Story = {
  args: {
    vehicles: vehicles.slice(0, 2),
  },
};
