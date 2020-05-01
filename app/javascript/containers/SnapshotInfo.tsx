import { connect } from 'react-redux';
import { ExamTakerState } from '@hourglass/types';
import SnapshotInfo from '@hourglass/components/SnapshotInfo';

function mapStateToProps(state: ExamTakerState) {
  const { snapshot } = state;
  const { message, status } = snapshot;
  return {
    status,
    message,
  };
}

export default connect(mapStateToProps)(SnapshotInfo);
