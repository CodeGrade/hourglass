import MoveItem from '@professor/exams/new/editor/components/MoveItem';
import { connect } from 'react-redux';
import {
  MDTP,
  ExamEditorAction,
} from '@professor/exams/new/types';

interface OwnProps {
  onUp: () => ExamEditorAction;
  onDown: () => ExamEditorAction;
  onDelete: () => ExamEditorAction;
}

const mapDispatchToProps: MDTP<{
  onUp: () => void;
  onDown: () => void;
  onDelete: () => void;
}, OwnProps> = (dispatch, ownProps) => {
  const { onUp, onDown, onDelete } = ownProps;
  return {
    onUp: (): void => { if (onUp) dispatch(onUp()); },
    onDown: (): void => { if (onDown) dispatch(onDown()); },
    onDelete: (): void => { if (onDelete) dispatch(onDelete()); },
  };
};

export default connect(null, mapDispatchToProps)(MoveItem);
