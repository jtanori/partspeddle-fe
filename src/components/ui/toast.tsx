'use client';

import * as React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onDismiss?: () => void;
}

const icons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5" />,
  error: <AlertCircle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
};

const styles: Record<ToastVariant, string> = {
  success: 'bg-status-success-soft text-status-success border-status-success/20',
  error: 'bg-status-danger-soft text-status-danger border-status-danger/20',
  info: 'bg-status-info-soft text-status-info border-status-info/20',
  warning: 'bg-status-warning-soft text-status-warning border-status-warning/20',
};

/**
 * Single toast notification.
 */
export function Toast({ message, variant = 'info', duration = 5000, onDismiss }: ToastProps) {
  React.useEffect(() => {
    if (!duration || !onDismiss) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4 shadow-floating',
        styles[variant],
      )}
    >
      {icons[variant]}
      <span className="flex-1 text-caption font-semibold">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close notification"
          className="rounded p-1 opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-current"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

interface ToastProviderProps {
  children: React.ReactNode;
}

/**
 * Toast provider wrapper. Place near the app root.
 * Currently a no-op placeholder; real toast management will be added when needed.
 */
export function ToastProvider({ children }: ToastProviderProps) {
  return <>{children}</>;
}
