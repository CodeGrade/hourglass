import React from 'react';
import { Spinner } from 'react-bootstrap';
import './Locked.css';

interface LockedProps {
  locked: boolean;
  examFinished: boolean;
}

const Locked = <P extends Record<string, unknown>>(
  Child: React.ComponentType<P>,
): React.FC<P & LockedProps> => {
  const WithLocked: React.FC<P & LockedProps> = (props) => {
    const { locked, examFinished } = props;
    const lockedClass = (locked || examFinished) ? '' : 'd-none';
    const lockType = examFinished ? 'bg-info' : 'bg-danger';
    const spinnerText = examFinished ? 'Exam complete' : 'Loading...';
    const ChildWithProps = React.createElement(Child, props, null);
    return (
      <div className="position-relative">
        <div
          className={`spinnerOuter w-100 h-100 position-absolute ${lockedClass}`}
        >
          <div
            className={`${lockType} w-100 h-100 position-absolute spinnerOverlay`}
          />
          <div
            className="spinnerInner position-absolute"
          >
            <Spinner animation="border" role="status" title={spinnerText}>
              <span className="sr-only">{spinnerText}</span>
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
