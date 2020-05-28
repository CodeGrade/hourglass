import ShowParts from '@professor/exams/new/editor/components/ShowParts';
import { connect } from 'react-redux';
import {
  MSTP,
  ExamEditorState,
} from '@professor/exams/new/types';

interface OwnProps {
  qnum: number;
}

const mapStateToProps: MSTP<{
  numParts: number;
}, OwnProps> = (state: ExamEditorState, ownProps) => {
  const { qnum } = ownProps;
  const { contents } = state;
  const q = contents.exam.questions[qnum];
  return {
    numParts: q.parts.length,
  };
};

export default connect(mapStateToProps)(ShowParts);
