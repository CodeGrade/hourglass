import React from 'react';
import { SnapshotStatus } from '@hourglass/types';
import { MdCloudDone, MdError } from 'react-icons/md';
import TooltipButton from '@hourglass/components/TooltipButton';

interface SnapshotInfoProps {
  status: SnapshotStatus;
  message: string;
}

const SnapshotInfo: React.FC<SnapshotInfoProps> = (props) => {
  const {
    status,
    message,
  } = props;
  const size = '1.5em';
  switch (status) {
    case SnapshotStatus.LOADING:
      return (
        <TooltipButton
          variant="info"
          disabled
          disabledMessage="Saving answers..."
        >
          <span className="spinner-border align-middle" style={{ width: size, height: size }} role="status" />
        </TooltipButton>
      );
    case SnapshotStatus.SUCCESS:
      return (
        <TooltipButton
          variant="success"
          disabled
          disabledMessage="Answers saved to server."
        >
          <MdCloudDone size={size} role="status" />
        </TooltipButton>
      );
    case SnapshotStatus.FAILURE:
      return (
        <TooltipButton
          variant="danger"
          disabled
          disabledMessage={`Failed saving snapshot: ${message}.`}
        >
          <MdError size={size} />
        </TooltipButton>
      );
    default:
      throw new Error('CASE NOT HANDLED');
  }
};

export default SnapshotInfo;
