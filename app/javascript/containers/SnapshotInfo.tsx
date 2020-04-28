import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { MdCloudDone, MdError } from 'react-icons/md';
import { ExamState } from '../types';
import { loadSnapshot, saveSnapshot } from '../actions';

const TIMEOUT = 10000;


function SnapshotInfo(props) {
  const {
    load, save, isLoading, success, message, size = '1.5em',
  } = props;
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    const timer = setInterval(save, TIMEOUT);
    return () => {
      clearInterval(timer);
    };
  }, [save]);
  if (isLoading) {
    return (
      <button className="btn btn-info" type="button" disabled>
        <span className="spinner-border align-middle" title="Saving answers..." style={{ width: size, height: size }} role="status" />
      </button>
    );
  } if (success) {
    return (
      <button className="btn btn-success" type="button" disabled>
        <MdCloudDone size={size} role="status" title="Answers saved to server" />
      </button>
    );
  }
  return (
    <button className="btn btn-danger" type="button" disabled role="status">
      <MdError title={`Error saving answers to server: ${message}`} size={size} />
    </button>
  );
}


function mapStateToProps(state: ExamState) {
  return {
    ...state.snapshot,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    load: () => dispatch(
      loadSnapshot(),
    ),
    save: () => dispatch(
      saveSnapshot(),
    ),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SnapshotInfo);
