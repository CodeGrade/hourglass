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
    fetch: () => dispatch(
      fetchSnapshot(),
    ),
    save: () => dispatch(
      saveSnapshot(),
    ),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SnapshotInfo);
