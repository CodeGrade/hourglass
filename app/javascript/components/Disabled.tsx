import React, { FunctionComponent } from 'react';
import { Spinner } from 'react-bootstrap';
import './Disabled.css';

export default (Child) => {
  const WithDisabled = (props) => {
    const disabledClass = props.disabled ? '' : 'd-none';
    return (
      <div>
        <div
          className={`spinnerOuter w-100 h-100 position-absolute ${disabledClass}`}
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
  }
  WithDisabled.displayName = 'WithDisabled';
  return WithDisabled;
}
