import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { ExamState } from '../types';
import { loadSnapshot, saveSnapshot } from '../actions';

const TIMEOUT = 10000;


function SnapshotInfo(props) {
  const { load, save, isLoading, success, message  } = props;
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    const timer = setInterval(save, TIMEOUT);
    return () => {
      clearInterval(timer);
    };
  }, [save]);
  return (
    <div>
      <div>
        {isLoading &&
         <p>LOADING</p> ||
         <div>
           <p>SUCCESS: {success ? "true" : "false"}</p>
           <p>MESSAGE: {message}</p>
         </div>
        }
      </div>
    </div>
  );
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
