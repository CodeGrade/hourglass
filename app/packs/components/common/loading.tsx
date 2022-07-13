import React from 'react';
import { Spinner } from 'react-bootstrap';
import LoadingOverlay from 'react-loading-overlay';

// TODO: just implement a fade ourselves...
import PropTypes from 'prop-types';

// eslint-disable-next-line react/forbid-foreign-prop-types
LoadingOverlay.propTypes.styles = PropTypes.shape({
  content: PropTypes.func,
  overlay: PropTypes.func,
  spinner: PropTypes.func,
  wrapper: PropTypes.func,
});

const STYLES = {
  overlay: (base) => ({
    ...base,
    borderRadius: '0.25rem',
  }),
  content: (base) => ({
    ...base,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  }),
};

const SPINNER = <Spinner animation="border" role="status" />;

const Loading: React.FC<React.PropsWithChildren<{
  loading: boolean;
  noText?: boolean;
  className?: string,
}>> = (props) => {
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
      styles={STYLES}
      spinner={SPINNER}
      text={noText ? undefined : 'Loading...'}
    >
      {children}
    </LoadingOverlay>
  );
};

export default Loading;
