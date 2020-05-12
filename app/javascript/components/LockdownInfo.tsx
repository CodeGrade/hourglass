import React from 'react';
import { MdLock, MdLockOpen } from 'react-icons/md';
import { LockdownStatus } from '@hourglass/types';
import { ICON_SIZE } from '@hourglass/constants';
import TooltipButton from '@hourglass/components/TooltipButton';
import { ExhaustiveSwitchError } from '@hourglass/helpers';

interface LockdownInfoProps {
  status: LockdownStatus;
  message: string;
}

const LockdownInfo: React.FC<LockdownInfoProps> = (props) => {
  const {
    status,
    message,
  } = props;
  switch (status) {
    case LockdownStatus.BEFORE:
      return (
        <TooltipButton
          variant="secondary"
          disabledMessage="Waiting for session lock."
          disabled
        >
          <MdLockOpen size={ICON_SIZE} />
        </TooltipButton>
      );
    case LockdownStatus.FAILED:
      return (
        <TooltipButton
          variant="danger"
          disabledMessage={message}
          disabled
        >
          <MdLockOpen size={ICON_SIZE} />
        </TooltipButton>
      );
    case LockdownStatus.LOCKED:
      return (
        <TooltipButton
          variant="success"
          disabledMessage="Session locked."
          disabled
        >
          <MdLock size={ICON_SIZE} />
        </TooltipButton>
      );
    case LockdownStatus.IGNORED:
      return (
        <TooltipButton
          variant="warning"
          disabledMessage="Session lock ignored"
          disabled
        >
          <MdLockOpen size={ICON_SIZE} />
        </TooltipButton>
      );
    default:
      throw new ExhaustiveSwitchError(status);
  }
};

export default LockdownInfo;
