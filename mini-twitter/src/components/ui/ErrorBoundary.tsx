"use client";

import React from "react";
import RetryableError from "@/components/ui/RetryableError";

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?:
    | React.ReactNode
    | ((error: Error, reset: () => void) => React.ReactNode);
  onRetry?: () => void;
  resetKey?: string | number;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.props.resetKey !== prevProps.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  handleRetry = () => {
    this.setState({ error: null });
    this.props.onRetry?.();
  };

  render() {
    const { error } = this.state;
    if (error) {
      const { fallback } = this.props;
      if (typeof fallback === "function") {
        return fallback(error, this.handleRetry);
      }
      if (fallback) {
        return fallback;
      }
      return (
        <RetryableError
          error={error}
          onRetry={this.handleRetry}
          retryLabel="Reload"
        />
      );
    }

    return this.props.children;
  }
}
