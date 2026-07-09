import '@testing-library/jest-dom';
import * as React from 'react';
import { vi } from 'vitest';

// Global mocks
vi.mock('next/link', () => ({
  default: ({ children, href = '#', ...props }: any) =>
    React.createElement('a', { href, ...props }, children),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
  })),
}));
