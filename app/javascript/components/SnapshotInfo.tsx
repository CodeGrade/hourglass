import React, { useEffect } from 'react';
import { SnapshotStatus } from '../types';
import { MdCloudDone, MdError } from 'react-icons/md';
import { useExamContext } from '../context';

const TIMEOUT = 10000;

interface SnapshotInfoProps {
  status: SnapshotStatus;
  message: string;
  fetch: (id: number) => void;
  save: (id: number) => void;
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
