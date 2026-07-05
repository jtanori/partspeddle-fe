import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PublicShell } from '@/components/layout/PublicShell';
import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { MainLoadingIndicator } from '@/components/common/MainLoadingIndicator';
import { InlineLoadingIndicator } from '@/components/common/InlineLoadingIndicator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () =>
    new URLSearchParams() as unknown as ReturnType<
      typeof import('next/navigation').useSearchParams
    >,
}));

vi.mock('@/store/hooks', () => ({
  useAuthStore: () => ({
    user: null,
    userRole: 'buyer',
    setUserRole: vi.fn(),
    logout: vi.fn(),
    profile: null,
  }),
  useCartStore: () => ({ cart: [], setIsCartOpen: vi.fn() }),
  useSearchStore: () => ({
    searchQueryText: '',
    setSearchQueryText: vi.fn(),
    setSearchCategory: vi.fn(),
  }),
  useSellerNavStore: () => ({
    activeSellerTab: 'listings',
    setActiveSellerTab: vi.fn(),
    setPendingSnapImages: vi.fn(),
  }),
  useUiStore: () => ({
    setSearchModalOpen: vi.fn(),
    setInfoModalType: vi.fn(),
    setTourActive: vi.fn(),
  }),
}));

vi.mock('@/assets/images/logo_solid.png', () => ({ default: { src: '/logo.png' } }));

describe('P3.7 layout standardization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PublicShell', () => {
    it('renders the public Navbar and Footer', () => {
      render(
        <PublicShell>
          <div data-testid="page-content">Hello</div>
        </PublicShell>,
      );

      expect(screen.getByTestId('page-content')).toHaveTextContent('Hello');
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('hides the Footer when showFooter is false', () => {
      render(
        <PublicShell showFooter={false}>
          <div data-testid="page-content">Dashboard</div>
        </PublicShell>,
      );

      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
    });
  });

  describe('AuthPageShell', () => {
    it('does not render the public Navbar', () => {
      render(
        <AuthPageShell>
          <div data-testid="auth-content">Sign in</div>
        </AuthPageShell>,
      );

      expect(screen.getByTestId('auth-content')).toHaveTextContent('Sign in');
      expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    });
  });

  describe('Loading indicators', () => {
    it('renders the main loading indicator with accessible busy state', () => {
      render(<MainLoadingIndicator label="Booting..." />);
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-busy', 'true');
      expect(status).toHaveTextContent('Booting...');
    });

    it('renders the inline loading indicator with accessible busy state', () => {
      render(<InlineLoadingIndicator label="Working..." />);
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-busy', 'true');
      expect(status).toHaveTextContent('Working...');
    });
  });

  describe('Route structure', () => {
    it('does not import AppWrapper/PublicShell in the root layout', () => {
      const rootLayout = fs.readFileSync(
        path.resolve(__dirname, '../../../src/app/layout.tsx'),
        'utf-8',
      );
      expect(rootLayout).not.toContain('AppWrapper');
      expect(rootLayout).not.toContain('PublicShell');
    });

    it('moves the homepage into the public route group', () => {
      const publicPage = path.resolve(__dirname, '../../../src/app/(public)/page.tsx');
      const rootPage = path.resolve(__dirname, '../../../src/app/page.tsx');
      expect(fs.existsSync(publicPage)).toBe(true);
      expect(fs.existsSync(rootPage)).toBe(false);
    });
  });
});
