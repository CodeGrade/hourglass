import React from 'react';
import { Container } from 'react-bootstrap';
import RegularNavbar from './navbar';

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

  render(): React.ReactNode {
    const { error } = this.state;
    const { withNavbar, withContainer } = this.props;
    if (error) {
      if (withNavbar) {
        return (
          <>
            <RegularNavbar />
            <Container>
              <RenderError error={error} />
            </Container>
          </>
        );
      }
      if (withContainer) {
        return (
          <Container>
            <RenderError error={error} />
          </Container>
        );
      }
      return (
        <RenderError error={error} />
      );
    }

    const { children } = this.props;

    return children;
  }
}
