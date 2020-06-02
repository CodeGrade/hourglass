import Body from '@professor/exams/new/editor/components/BodyItem';
import { connect } from 'react-redux';
import {
  MSTP,
  ExamEditorState,
} from '@professor/exams/new/types';
import { BodyItem } from '@student/exams/show/types';

interface OwnProps {
  qnum: number;
  pnum: number;
  bnum: number;
  numBodyItems: number;
}

const mapStateToProps: MSTP<{
  body: BodyItem;
}, OwnProps> = (state: ExamEditorState, ownProps) => {
  const { qnum, pnum, bnum } = ownProps;
  const { contents } = state;
  const b = contents.exam.questions[qnum].parts[pnum].body[bnum];
  return {
    body: b,
  };
};

export default connect(mapStateToProps)(Body);
