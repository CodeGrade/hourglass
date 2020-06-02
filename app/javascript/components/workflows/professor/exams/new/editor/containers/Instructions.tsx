import Instructions from '@professor/exams/new/editor/components/Instructions';
import { connect } from 'react-redux';
import {
  MSTP,
  MDTP,
  ExamEditorState,
} from '@professor/exams/new/types';
import { updateInstructions } from '@professor/exams/new/actions';

const mapStateToProps: MSTP<{
  value: string;
}, {}> = (state: ExamEditorState, _ownProps) => {
  const { contents } = state;
  return {
    value: contents.exam.instructions,
  };
};

const mapDispatchToProps: MDTP<{
  onChange: (newState: string) => void;
}, {}> = (dispatch, _ownProps) => ({
  onChange: (newState: string): void => {
    dispatch(
      updateInstructions(
        newState,
      ),
    );
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Instructions);
