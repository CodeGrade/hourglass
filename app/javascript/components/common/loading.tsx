import React from 'react';
import { Spinner } from 'react-bootstrap';
import './loading.css';

const Loading: React.FC<{ loading: boolean }> = (props) => {
  const { loading, children } = props;
  const loadingClass = loading ? '' : 'd-none';
  return (
    <div className="d-inline-block position-relative">
      <div className={`${loadingClass} loadingSpinnerOuter`}>
        <div className="loadingSpinnerInner">
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        </div>
      </div>
      <div className={loading ? 'loadingSpinnerDim' : ''}>
        {children}
      </div>
    </div>
  );
};

export default Loading;
