import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React tree:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="font-serif font-bold text-2xl text-black dark:text-white">
            Something went wrong
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-md">
            We encountered a temporary display issue. Please refresh or return to the home page.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-xs inline-flex items-center gap-2 shadow-sm hover:opacity-90 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reload Page
            </button>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-semibold text-xs hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
