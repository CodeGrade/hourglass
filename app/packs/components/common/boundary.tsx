import React from 'react';

export const RenderError: React.FC<{
  error: Error;
}> = ({ error }) => (
  <span className="text-danger">
    <p>Something went wrong.</p>
    <small>{error.message}</small>
  </span>
);

interface ErrorState {
  error?: Error;
}

type ErrorProps = Record<string, unknown>;

export default class ErrorBoundary extends React.Component<ErrorProps, ErrorState> {
  constructor(props: ErrorProps) {
    super(props);
    this.state = {};
  }

  static getDerivedStateFromError(error: Error): ErrorState {
    return {
      error,
    };
  }

  render(): React.ReactNode {
    const { error } = this.state;
    if (error) {
      return (
        <RenderError error={error} />
      );
    }

    const { children } = this.props;

    return children;
  }
}
