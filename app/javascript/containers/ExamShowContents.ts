import ExamShowContents from '@hourglass/components/ExamShowContents';
import { connect } from 'react-redux';
import { saveSnapshot } from '@hourglass/actions';
import {
  ExamState,
  MSTP,
  MDTP,
  ExamInfo,
} from '@hourglass/types';

interface OwnProps {
  exam: ExamInfo;
}

const mapStateToProps: MSTP<{examState: ExamState}, OwnProps> = (state) => ({
  examState: state.contents.data.exam,
});

const mapDispatchToProps: MDTP<{
  save: () => void;
}, OwnProps> = (dispatch, ownProps) => ({
  save: (): void => {
    dispatch(saveSnapshot(ownProps.exam.id));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ExamShowContents);
