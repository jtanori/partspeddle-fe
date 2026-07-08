import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FilterGroup } from './filter-group';

const meta: Meta<typeof FilterGroup> = {
  component: FilterGroup,
  title: 'UI/FilterGroup',
};

export default meta;

type Story = StoryObj<typeof FilterGroup>;

const initialOptions = [
  { value: 'honda', label: 'Honda', count: 12 },
  { value: 'toyota', label: 'Toyota', count: 8 },
  { value: 'ford', label: 'Ford', count: 5 },
];

export const Default: Story = {
  render: () => {
    const [options, setOptions] = useState(initialOptions);
    const handleChange = (value: string, checked: boolean) => {
      setOptions((prev) =>
        prev.map((opt) => (opt.value === value ? { ...opt, checked } : opt)),
      );
    };
    return <FilterGroup title="Manufacturer" options={options} onChange={handleChange} />;
  },
};
