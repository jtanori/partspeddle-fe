import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { ToastProvider, useToast } from '@/components/ui/toast';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

function TestToastConsumer() {
  const { addToast } = useToast();
  return (
    <button type="button" onClick={() => addToast('Hello', { variant: 'success' })}>
      Show Toast
    </button>
  );
}

describe('P5.0 UX Polish', () => {
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

  });

  describe('notification center', () => {
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
  });
});
