import React from 'react';

interface ErrorState {
  error?: string;
}

type ErrorProps = Record<string, unknown>;

export default class ErrorBoundary extends React.Component<ErrorProps, ErrorState> {
  constructor(props: ErrorProps) {
    super(props);
    this.state = {};
  }

  static getDerivedStateFromError(error: Error): ErrorState {
    return {
      error: error.message,
    };
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <span className="text-danger">
          <p>
            Something went wrong.
          </p>
          <small>
            {error}
          </small>
        </span>
      );
    }

    const { children } = this.props;

    return children;
  }
}
