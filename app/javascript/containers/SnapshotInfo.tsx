import { connect } from 'react-redux';
import { fetchSnapshot, saveSnapshot } from '../actions';
import SnapshotInfo from '../components/SnapshotInfo';
import { ExamState } from '../types';

function mapStateToProps(state: ExamState) {
  const { snapshot } = state;
  const { status, message } = snapshot;
  return {
    status,
    message,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetch: (id) => dispatch(
      fetchSnapshot(id),
    ),
    save: (id) => dispatch(
      saveSnapshot(id),
    ),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SnapshotInfo);
