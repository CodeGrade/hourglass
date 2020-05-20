import { connect } from 'react-redux';
import { ExamTakerState, MSTP, SnapshotStatus } from '@examTaker/types';
import SnapshotInfo from '@examTaker/components/SnapshotInfo';

const mapStateToProps: MSTP<{
  status: SnapshotStatus;
  message: string;
}> = (state: ExamTakerState) => ({
  status: state.snapshot.status,
  message: state.snapshot.message,
});

export default connect(mapStateToProps)(SnapshotInfo);
