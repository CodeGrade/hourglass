import { connect } from 'react-redux';
import PreStart from '@student/exams/show/components/PreStart';
import {
  LockdownStatus,
  ExamTakerState,
  MDTP,
  RailsExamVersion,
  MSTP,
  RailsCourse,
} from '@student/exams/show/types';
import { doTryLockdown } from '@student/exams/show/actions';

interface OwnProps {
  railsExam: RailsExamVersion;
  railsCourse: RailsCourse;
}

const mapDispatchToProps: MDTP<{
  onClick: () => void;
}, OwnProps> = (dispatch, ownProps) => ({
  onClick: (): void => {
    dispatch(doTryLockdown(ownProps.railsCourse, ownProps.railsExam));
  },
});

const mapStateToProps: MSTP<{
  isError: boolean;
  errorMsg: string;
}, OwnProps> = (state: ExamTakerState) => ({
  isError: state.lockdown.status === LockdownStatus.FAILED,
  errorMsg: state.lockdown.message,
});

const PreStartConnected = connect(mapStateToProps, mapDispatchToProps)(PreStart);
PreStartConnected.displayName = 'PreStartConnected';
export default PreStartConnected;
PreStart.whyDidYouRender = true;
