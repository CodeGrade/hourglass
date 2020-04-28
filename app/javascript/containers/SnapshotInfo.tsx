import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { ExamState } from '../types';
import { loadSnapshot, saveSnapshot } from '../actions';
import { MdCloudDone, MdError } from 'react-icons/md';

const TIMEOUT = 10000;


function SnapshotInfo(props) {
  const { load, save, isLoading, success, message, size = "1.5em" } = props;
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
    return (<button className="btn btn-info" type="button" disabled>
      <div className={"spinner-border align-middle"} style={{width: size, height: size}} role={"status"}>
        <span className={"sr-only"}>Loading...</span>
      </div>
    </button>);
  } else if (success) {
    return (<button className="btn btn-success" type="button" disabled>
      <MdCloudDone size={size} role="status" />
      <span className={"sr-only"}>Answers saved to server</span>
    </button>);
  } else {
    return (<button className="btn btn-danger" type="button" disabled role={"status"}>
      <MdError title={message} size={size} />
      <span className={"sr-only"}>Error saving answers to server</span>
    </button>);
  }
}


function mapStateToProps(state: ExamState) {
  return {
    ...state.snapshot
  };
}

function mapDispatchToProps(dispatch) {
  return {
    load: () => dispatch(
      loadSnapshot()
    ),
    save: () => dispatch(
      saveSnapshot()
    ),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SnapshotInfo);
