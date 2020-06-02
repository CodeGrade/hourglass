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
  onDelete: () => ExamEditorAction;
}

const mapStateToProps: MSTP<{}, OwnProps> = (state: ExamEditorState, _ownProps) => state;

const mapDispatchToProps: MDTP<{}, OwnProps> = (dispatch, ownProps) => {
  const { onUp, onDown, onDelete } = ownProps;
  return {
    onUp: (): void => { if (onUp) dispatch(onUp()); },
    onDown: (): void => { if (onDown) dispatch(onDown()); },
    onDelete: (): void => { if (onDelete) dispatch(onDelete()); },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MoveItem);
