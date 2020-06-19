import { connect } from 'react-redux';
import { ExamTakerState, MSTP, SnapshotStatus } from '@student/exams/show/types';
import SnapshotInfo from '@student/exams/show/components/SnapshotInfo';

const mapStateToProps: MSTP<{
  status: SnapshotStatus;
  message: string;
}> = (state: ExamTakerState) => ({
  status: state.snapshot.status,
  message: state.snapshot.message,
});

const SnapshotInfoConnected = connect(mapStateToProps)(SnapshotInfo);
SnapshotInfoConnected.displayName = 'SnapshotInfoConnected';
export default SnapshotInfoConnected;
SnapshotInfo.whyDidYouRender = true;
