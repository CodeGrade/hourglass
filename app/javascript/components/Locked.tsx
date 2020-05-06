import React from 'react';
import { Spinner } from 'react-bootstrap';
import './Locked.css';

interface LockedProps {
  locked: boolean;
}

const Locked = <P extends {}>(Child: React.ComponentType<P>): React.FC<P & LockedProps> => {
  const WithLocked: React.FC<P & LockedProps> = (props) => {
    const { locked } = props;
    const lockedClass = locked ? '' : 'd-none';
    const ChildWithProps = React.createElement(Child, props, null);
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
        {ChildWithProps}
      </div>
    );
  };
  return WithLocked;
};

export default Locked;
