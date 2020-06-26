import React from 'react';
import { Spinner } from 'react-bootstrap';
import LoadingOverlay from 'react-loading-overlay';

const Loading: React.FC<{ loading: boolean; className?: string }> = (props) => {
  const { loading, className, children } = props;
  return (
    <LoadingOverlay
      className={className}
      active={loading}
      spinner={<Spinner animation="border" role="status" />}
    >
      {children}
    </LoadingOverlay>
  );
};

export default Loading;
