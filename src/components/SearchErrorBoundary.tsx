'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class SearchErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Search Component Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-12 text-center bg-white border border-zinc-200 rounded max-w-md mx-auto space-y-4 font-sans shadow-xs">
          <AlertTriangle className="w-12 h-12 text-rust-copper mx-auto" />
          <h3 className="font-display text-lg font-bold uppercase text-zinc-850">Search Unavailable</h3>
          <p className="text-xs text-zinc-500 leading-relaxed font-medium">
            We encountered an unexpected issue while loading your search results. Please try refreshing the page or clearing your filters.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-rust-copper hover:bg-[#8B6239] text-white text-xs font-display font-extrabold uppercase py-3 px-8 rounded-sm transition-all shadow-md active:translate-y-0.5"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
