import React from 'react';
import { MdLock, MdLockOpen } from 'react-icons/md';
import { LockdownStatus } from '@hourglass/types';
import TooltipButton from '@hourglass/components/TooltipButton';

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
  switch (status) {
    case 'BEFORE':
      return (
        <TooltipButton
          variant="secondary"
          disabledMessage="Waiting for session lock."
          disabled
        >
          <MdLockOpen size={size} />
        </TooltipButton>
      );
    case 'FAILED':
      return (
        <TooltipButton
          variant="danger"
          disabledMessage={message}
          disabled
        >
          <MdLockOpen size={size} />
        </TooltipButton>
      );
    case 'LOCKED':
      return (
        <TooltipButton
          variant="success"
          disabledMessage="Session locked."
          disabled
        >
          <MdLock size={size} />
        </TooltipButton>
      );
    case 'IGNORED':
      return (
        <TooltipButton
          variant="warning"
          disabledMessage="Session lock ignored"
          disabled
        >
          <MdLockOpen size={size} />
        </TooltipButton>
      );
    default:
      throw new Error('UNHANDLED CASE');
  }
};

export default LockdownInfo;
