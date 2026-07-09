import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global mocks
vi.mock('next/link', () => ({
  default: ({ children, href = '#', ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
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
