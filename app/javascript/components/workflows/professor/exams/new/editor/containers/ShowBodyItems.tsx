import ShowBodyItems from '@professor/exams/new/editor/components/ShowBodyItems';
import { connect } from 'react-redux';
import {
  MSTP,
  ExamEditorState,
} from '@professor/exams/new/types';

interface OwnProps {
  qnum: number;
  pnum: number;
}

const mapStateToProps: MSTP<{
  numBodyItems: number;
}, OwnProps> = (state: ExamEditorState, ownProps) => {
  const { qnum, pnum } = ownProps;
  const { contents } = state;
  const p = contents.exam.questions[qnum].parts[pnum];
  return {
    numBodyItems: p.body.length,
  };
};

export default connect(mapStateToProps)(ShowBodyItems);
