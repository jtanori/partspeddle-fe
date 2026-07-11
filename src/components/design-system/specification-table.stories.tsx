import type { Meta, StoryObj } from '@storybook/react';
import { SpecificationTable } from './specification-table';

const meta: Meta<typeof SpecificationTable> = {
  component: SpecificationTable,
  title: 'Design System/SpecificationTable',
};

export default meta;

type Story = StoryObj<typeof SpecificationTable>;

const specs = [
  { label: 'Condition', value: 'Used OEM' },
  { label: 'Mileage', value: '45,000', unit: 'mi' },
  { label: 'Part Number', value: 'BOS-0986AN' },
  { label: 'Voltage', value: '12', unit: 'V' },
  { label: 'Amperage', value: '90', unit: 'A' },
];

export const Default: Story = {
  args: {
    specs,
  },
};

export const SingleColumn: Story = {
  args: {
    specs,
    columns: 1,
  },
};
