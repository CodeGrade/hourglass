import ExamShowContents from '@examTaker/components/ExamShowContents';
import { connect } from 'react-redux';
import { saveSnapshot } from '@examTaker/actions';
import {
  Exam,
  MSTP,
  MDTP,
  RailsExam,
} from '@examTaker/types';

interface OwnProps {
  railsExam: RailsExam;
}

const mapStateToProps: MSTP<{exam: Exam}, OwnProps> = (state) => ({
  exam: state.contents.exam,
});

const mapDispatchToProps: MDTP<{
  save: () => void;
}, OwnProps> = (dispatch, ownProps) => ({
  save: (): void => {
    dispatch(saveSnapshot(ownProps.railsExam.id));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ExamShowContents);
