import React, { useEffect } from 'react';
import { SnapshotStatus } from '../types';
import { MdCloudDone, MdError } from 'react-icons/md';

const TIMEOUT = 10000;

interface SnapshotInfoProps {
  status: SnapshotStatus;
  message: string;
  fetch: () => void;
  save: () => void;
  size?: string;
}

export default function SnapshotInfo(props: SnapshotInfoProps) {
  const {
    fetch,
    save,
    status,
    message,
    size = '1.5em',
  } = props;
  useEffect(() => {
    fetch();
  }, [fetch]);
  useEffect(() => {
    const timer = setInterval(save, TIMEOUT);
    return () => {
      clearInterval(timer);
    };
  }, [save]);
  switch (status) {
    case SnapshotStatus.LOADING:
      return (
        <button className="btn btn-info" type="button" disabled>
          <span className="spinner-border align-middle" title="Saving answers..." style={{ width: size, height: size }} role="status" />
        </button>
      );
    case SnapshotStatus.SUCCESS:
      return (
        <button className="btn btn-success" type="button" disabled>
          <MdCloudDone size={size} role="status" title="Answers saved to server" />
        </button>
      );
    case SnapshotStatus.FAILURE:
      return (
        <button className="btn btn-danger" type="button" disabled role="status">
          <MdError title={`Error saving answers to server: ${message}`} size={size} />
        </button>
      );
  }
}
