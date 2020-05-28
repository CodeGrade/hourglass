import MoveItem from '@professor/exams/new/editor/components/MoveItem';
import { connect } from 'react-redux';
import {
  MSTP,
  MDTP,
  ExamEditorAction,
  ExamEditorState,
} from '@professor/exams/new/types';


interface OwnProps {
  onUp: () => ExamEditorAction;
  onDown: () => ExamEditorAction;
}

const mapStateToProps: MSTP<{}, OwnProps> = (state: ExamEditorState, _ownProps) => state;

const mapDispatchToProps: MDTP<{}, OwnProps> = (dispatch, ownProps) => {
  const { onUp, onDown } = ownProps;
  return {
    onUp: (): void => { if (onUp) dispatch(onUp()); },
    onDown: (): void => { if (onDown) dispatch(onDown()); },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MoveItem);
