"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-4 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-2xl">
            ⚠️
          </div>
          <div>
            <p className="text-gray-700 font-medium mb-1">頁面發生錯誤</p>
            <p className="text-gray-400 text-sm">
              {this.state.error?.message || "未知錯誤，請重新整理頁面"}
            </p>
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: undefined });
              window.location.reload();
            }}
            className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            重新整理
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
