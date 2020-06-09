import Instructions from '@professor/exams/new/editor/components/Instructions';
import { connect } from 'react-redux';
import {
  MSTP,
  MDTP,
  ExamEditorState,
} from '@professor/exams/new/types';
import { updateInstructions } from '@professor/exams/new/actions';
import { HTMLVal } from '@hourglass/workflows/student/exams/show/types';

const mapStateToProps: MSTP<{
  value: HTMLVal;
}> = (state: ExamEditorState) => {
  const { contents } = state;
  return {
    value: contents.exam.instructions,
  };
};

const mapDispatchToProps: MDTP<{
  onChange: (newState: HTMLVal) => void;
}> = (dispatch) => ({
  onChange: (newState): void => {
    dispatch(
      updateInstructions(
        newState,
      ),
    );
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Instructions);
