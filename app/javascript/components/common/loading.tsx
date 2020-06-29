import React from 'react';
import { Spinner } from 'react-bootstrap';
import LoadingOverlay from 'react-loading-overlay';

const Loading: React.FC<{
  loading: boolean;
  noText?: boolean;
  className?: string,
}> = (props) => {
  const {
    loading,
    className,
    children,
    noText = false,
  } = props;
  return (
    <LoadingOverlay
      className={className}
      active={loading}
      spinner={(
        <>
          <Spinner animation="border" role="status" />
          <br />
        </>
      )}
      text={noText ? undefined : 'Loading...'}
    >
      {children}
    </LoadingOverlay>
  );
};

export default Loading;
