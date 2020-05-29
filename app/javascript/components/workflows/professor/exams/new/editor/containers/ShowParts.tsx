import ShowParts from '@professor/exams/new/editor/components/ShowParts';
import { connect } from 'react-redux';
import {
  MSTP,
  MDTP,
  ExamEditorState,
} from '@professor/exams/new/types';
import { addPart } from '@professor/exams/new/actions';
import { PartInfo } from '@student/exams/show/types';

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

const mapDispatchToProps: MDTP<{
  addPart: (pnum: number, part: PartInfo) => void;
}, OwnProps> = (dispatch, ownProps) => ({
  addPart: (pnum: number, part: PartInfo): void => {
    const { qnum } = ownProps;
    dispatch(addPart(qnum, pnum, part));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ShowParts);
