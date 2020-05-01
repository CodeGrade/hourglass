import { connect } from 'react-redux';
import { snapshotDisable, fetchSnapshot, saveSnapshot } from '@hourglass/actions';
import {
  DoSnapshot as DoSnap,
  NoSnapshot as NoSnap,
} from '@hourglass/components/SnapshotInfo';
import { ExamState } from '@hourglass/types';

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
    disableSnapshots: () => dispatch(snapshotDisable()),
  };
}

export const DoSnapshot = connect(mapStateToProps, mapDispatchToProps)(DoSnap);
export const NoSnapshot = connect(mapStateToProps, mapDispatchToProps)(NoSnap);
