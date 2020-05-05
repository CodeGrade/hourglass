import React from 'react';
import { Button } from 'react-bootstrap';
import { MdLock, MdLockOpen } from 'react-icons/md';
import { useExamInfoContext } from '@hourglass/context';
import { LockdownStatus } from '@hourglass/types';

interface LockdownInfoProps {
  status: LockdownStatus;
  message: string;
}

const LockdownInfo: React.FC<LockdownInfoProps> = (props) => {
  const {
    status,
    message,
  } = props;
  const size = '1.5em';
  const { id } = useExamInfoContext().exam;
  switch (status) {
    case 'BEFORE':
      return (
        <Button
          variant="secondary"
          disabled
        >
          <MdLockOpen title={message} size={size} />
        </Button>
      );
    case 'FAILED':
      return (
        <Button
          variant="danger"
          disabled
        >
          <MdLockOpen title={message} size={size} />
        </Button>
    );
    case 'LOCKED':
      return (
        <Button
          variant="success"
          disabled>
          <MdLock size={size} title="Session locked" />
        </Button>
      );
    default:
      throw new Error("UNHANDLED CASE");
  }
}

export default LockdownInfo;
