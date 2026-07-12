import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SearchInput } from './search-input';

const meta: Meta<typeof SearchInput> = {
  component: SearchInput,
  title: 'UI/SearchInput',
};

export default meta;

type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return <SearchInput value={value} onChange={setValue} onSubmit={(v) => alert(`Search: ${v}`)} />;
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    placeholder: 'Searching...',
  },
};
