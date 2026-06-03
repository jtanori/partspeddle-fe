import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global mocks
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
