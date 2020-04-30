import React, { FunctionComponent } from 'react';
import { Spinner } from 'react-bootstrap';

export default (Child) => {
  const WithDisabled = (props) => {
    return (
      <div>
        <div
          style={{
            display: props.disabled ? 'block' : 'none',
            width: '100%',
            height: '100%',
            position: 'absolute',
            zIndex: 1000,
          }}
        >
          <div
            className="bg-danger"
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              opacity: 0.6,
            }}
          />
          <div
            style={{
              position: 'absolute',
              transform: 'translate(-50%,-50%)',
              top: '50%',
              left: '50%',
            }}
          >
            <Spinner animation="border" role="status">
              <span className="sr-only">Loading...</span>
            </Spinner>
          </div>
        </div>
        <Child {...props} />
      </div>
    );
  }
  WithDisabled.displayName = 'WithDisabled';
  return WithDisabled;
}
