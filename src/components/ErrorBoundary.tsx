'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
  message?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-8 border border-amber-200/80 bg-amber-50/40 rounded-2xl text-center max-w-lg mx-auto my-10 shadow-sm">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xs">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-900 mb-2">
            {this.props.title || 'Something went wrong rendering this section'}
          </h3>
          <p className="text-sm text-stone-600 mb-6 leading-relaxed">
            {this.props.message ||
              this.state.error?.message ||
              'An unexpected rendering error occurred. You can attempt to reload this view.'}
          </p>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-xl text-sm font-medium transition cursor-pointer shadow-sm active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Reload View
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
