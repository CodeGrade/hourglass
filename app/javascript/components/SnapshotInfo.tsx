import React, { useEffect } from 'react';
import { SnapshotStatus } from '@hourglass/types';
import { MdCloudDone, MdCloudOff, MdError } from 'react-icons/md';
import { useExamContext } from '@hourglass/context';

const TIMEOUT = 10000;

interface SnapshotInfoProps {
  status: SnapshotStatus;
  message: string;
  fetch: (id: number) => void;
  save: (id: number) => void;
  disableSnapshots: () => void;
}

export function DoSnapshot(props: SnapshotInfoProps) {
  const {
    fetch,
    save,
    status,
    message,
  } = props;
  const size = '1.5em';
  const { id } = useExamContext();
  useEffect(() => {
    fetch(id);
  }, [fetch]);
  useEffect(() => {
    const timer = setInterval(() => save(id), TIMEOUT);
    return () => {
      clearInterval(timer);
    };
  }, [save]);
  switch (status) {
    case SnapshotStatus.BEFORE:
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
          <MdError title={message} size={size} />
        </button>
      );
  }
}

export function NoSnapshot(props: SnapshotInfoProps) {
  const {
    message,
    disableSnapshots,
  } = props;
  const size = '1.5em';
  useEffect(() => {
    disableSnapshots();
  }, []);
  return (
    <button className="btn btn-secondary" type="button" disabled role="status">
      <MdCloudOff title={message} size={size} />
    </button>
  );
}
