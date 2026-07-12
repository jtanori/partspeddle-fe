import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { ToastProvider, useToast } from '@/components/ui/toast';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf-8');
}

function TestToastConsumer() {
  const { addToast } = useToast();
  return (
    <button type="button" onClick={() => addToast('Hello', { variant: 'success' })}>
      Show Toast
    </button>
  );
}

describe('P5.0 UX Polish', () => {
  describe('spinner to skeleton migration', () => {
    it('removes MainLoadingIndicator from public loading page', () => {
      const source = readSource('apps/web/src/app/(public)/loading.tsx');
      expect(source).not.toContain('MainLoadingIndicator');
      expect(source).toContain('Skeleton');
    });

    it('removes InlineLoadingIndicator from search loading page', () => {
      const source = readSource('apps/web/src/app/(public)/search/loading.tsx');
      expect(source).not.toContain('InlineLoadingIndicator');
      expect(source).toContain('Skeleton');
    });

    it('removes MainLoadingIndicator from AuthProvider', () => {
      const source = readSource('apps/web/src/components/providers/AuthProvider.tsx');
      expect(source).not.toContain('MainLoadingIndicator');
      expect(source).toContain('Skeleton');
    });

    it('removes InlineLoadingIndicator from ProductSidebar', () => {
      const source = readSource('apps/web/src/components/ProductSidebar.tsx');
      expect(source).not.toContain('InlineLoadingIndicator');
      expect(source).toContain('Skeleton');
    });

    it('removes spinner component files', async () => {
      const fs = await import('node:fs');
      expect(fs.existsSync(resolve(process.cwd(), 'apps/web/src/components/common/InlineLoadingIndicator.tsx'))).toBe(false);
      expect(fs.existsSync(resolve(process.cwd(), 'apps/web/src/components/common/MainLoadingIndicator.tsx'))).toBe(false);
    });
  });

  describe('empty and error states', () => {
    it('EmptyState renders with Button component', () => {
      const onAction = vi.fn();
      render(
        <EmptyState
          title="No items"
          description="There is nothing here."
          actionText="Go back"
          onAction={onAction}
        />,
      );

      expect(screen.getByRole('heading', { name: 'No items' })).toBeDefined();
      const button = screen.getByRole('button', { name: 'Go back' });
      expect(button).toBeDefined();
      fireEvent.click(button);
      expect(onAction).toHaveBeenCalled();
    });

    it('ErrorState renders title, description, and retry action', () => {
      const onRetry = vi.fn();
      render(
        <ErrorState
          title="Load failed"
          description="Could not fetch data."
          onRetry={onRetry}
        />,
      );

      expect(screen.getByRole('heading', { name: 'Load failed' })).toBeDefined();
      const button = screen.getByRole('button', { name: /Try Again/i });
      expect(button).toBeDefined();
      fireEvent.click(button);
      expect(onRetry).toHaveBeenCalled();
    });

    it('InventoryTable uses EmptyState and ErrorState', () => {
      const source = readSource('apps/web/src/components/seller-dashboard/InventoryTable.tsx');
      expect(source).toContain('EmptyState');
      expect(source).toContain('ErrorState');
    });
  });

  describe('notification center', () => {
    it('Providers wraps app in ToastProvider', () => {
      const source = readSource('apps/web/src/components/Providers.tsx');
      expect(source).toContain('ToastProvider');
    });

    it('useToast queues and renders a toast', async () => {
      render(
        <ToastProvider>
          <TestToastConsumer />
        </ToastProvider>,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Show Toast' }));

      await waitFor(() => {
        expect(screen.getByText('Hello')).toBeDefined();
      });
    });

    it('navbar no longer renders local floating toast bar', () => {
      const source = readSource('apps/web/src/components/navbar/Navbar.tsx');
      expect(source).not.toContain('Floating toast notification bar');
      expect(source).toContain('useToast');
    });
  });

  describe('sticky panels', () => {
    it('seller inventory toolbar is sticky', () => {
      const source = readSource('apps/web/src/app/(seller)/seller/inventory/page.tsx');
      expect(source).toContain('sticky');
    });

    it('search sidebar is sticky', () => {
      const source = readSource('apps/web/src/components/search/SearchPageClient.tsx');
      expect(source).toContain('sticky');
    });
  });
});
