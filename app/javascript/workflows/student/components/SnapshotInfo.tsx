import React from 'react';
import { SnapshotStatus } from '@student/types';
import { MdCloudDone, MdError } from 'react-icons/md';
import TooltipButton from '@student/components/TooltipButton';
import { ExhaustiveSwitchError } from '@student/helpers';
import Icon from '@student/components/Icon';
import { AiOutlineLoading } from 'react-icons/ai';

interface SnapshotInfoProps {
  status: SnapshotStatus;
  message: string;
}

const SnapshotInfo: React.FC<SnapshotInfoProps> = (props) => {
  const {
    status,
    message,
  } = props;
  switch (status) {
    case SnapshotStatus.LOADING:
      return (
        <TooltipButton
          variant="info"
          disabled
          disabledMessage="Saving answers..."
        >
          <Icon I={AiOutlineLoading} />
        </TooltipButton>
      );
    case SnapshotStatus.SUCCESS:
      return (
        <TooltipButton
          variant="success"
          disabled
          disabledMessage="Answers saved to server."
        >
          <Icon I={MdCloudDone} />
        </TooltipButton>
      );
    case SnapshotStatus.FAILURE:
      return (
        <TooltipButton
          variant="danger"
          disabled
          disabledMessage={`Failed saving snapshot: ${message}.`}
        >
          <Icon I={MdError} />
        </TooltipButton>
      );
    default:
      throw new ExhaustiveSwitchError(status);
  }
};

export default SnapshotInfo;
