import ShowBodyItems from '@professor/exams/new/editor/components/ShowBodyItems';
import { connect } from 'react-redux';
import {
  MSTP,
  MDTP,
  ExamEditorState,
} from '@professor/exams/new/types';
import { addBodyItem } from '@professor/exams/new/actions';
import { BodyItem } from '@student/exams/show/types';


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

const mapDispatchToProps: MDTP<{
  addBodyItem: (bnum: number, info: BodyItem) => void;
}, OwnProps> = (dispatch, ownProps) => ({
  addBodyItem: (bnum: number, item: BodyItem): void => {
    const { qnum, pnum } = ownProps;
    dispatch(addBodyItem(qnum, pnum, bnum, item));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ShowBodyItems);
