import React from 'react';
import { MdLock, MdLockOpen } from 'react-icons/md';
import { LockdownStatus } from '@examTaker/types';
import TooltipButton from '@examTaker/components/TooltipButton';
import { ExhaustiveSwitchError } from '@examTaker/helpers';
import Icon from '@examTaker/components/Icon';

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
          <Icon I={MdLockOpen} />
        </TooltipButton>
      );
    case LockdownStatus.FAILED:
      return (
        <TooltipButton
          variant="danger"
          disabledMessage={message}
          disabled
        >
          <Icon I={MdLockOpen} />
        </TooltipButton>
      );
    case LockdownStatus.LOCKED:
      return (
        <TooltipButton
          variant="success"
          disabledMessage="Session locked."
          disabled
        >
          <Icon I={MdLock} />
        </TooltipButton>
      );
    case LockdownStatus.IGNORED:
      return (
        <TooltipButton
          variant="warning"
          disabledMessage="Session lock ignored"
          disabled
        >
          <Icon I={MdLockOpen} />
        </TooltipButton>
      );
    default:
      throw new ExhaustiveSwitchError(status);
  }
};

export default LockdownInfo;
