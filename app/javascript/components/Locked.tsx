import React, { FunctionComponent } from 'react';
import { Spinner } from 'react-bootstrap';
import './Locked.css';

export default (Child) => {
  const WithLocked: React.FC<{
    locked: boolean;
  }> = (props) => {
    const lockedClass = props.locked ? '' : 'd-none';
    return (
      <div>
        <div
          className={`spinnerOuter w-100 h-100 position-absolute ${lockedClass}`}
        >
          <div
            className="bg-danger w-100 h-100 position-absolute spinnerOverlay"
          />
          <div
            className="spinnerInner position-absolute"
          >
            <Spinner animation="border" role="status">
              <span className="sr-only">Loading...</span>
            </Spinner>
          </div>
        </div>
        <Child {...props} />
      </div>
    );
  };
  WithLocked.displayName = 'WithLocked';
  return WithLocked;
};
