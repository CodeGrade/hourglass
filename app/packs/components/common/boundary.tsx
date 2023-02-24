import React from 'react';
import { Container } from 'react-bootstrap';
import RegularNavbar from './navbar';

export const RenderError: React.FC<{
  error: Error;
  errorInfo?: unknown;
}> = ({ error, errorInfo }) => (
  <span className="text-danger">
    <p>Something went wrong.</p>
    <small>{error.message}</small>
    <pre>{errorInfo?.['componentStack']}</pre>
  </span>
);

interface ErrorState {
  error?: Error;
  errorInfo?: unknown;
  withNavbar?: boolean;
  withContainer?: boolean;
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

  componentDidCatch(error: Error, errorInfo: unknown) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    // You can also log error messages to an error reporting service here
  }

  render(): React.ReactNode {
    const { error, errorInfo } = this.state;
    const { withNavbar, withContainer } = this.props;
    if (error) {
      if (withNavbar) {
        return (
          <>
            <RegularNavbar />
            <Container>
              <RenderError error={error} errorInfo={errorInfo} />
            </Container>
          </>
        );
      }
      if (withContainer) {
        return (
          <Container>
            <RenderError error={error}  errorInfo={errorInfo} />
          </Container>
        );
      }
      return (
        <RenderError error={error} errorInfo={errorInfo} />
      );
    }

    const { children } = this.props;

    return children;
  }
}
