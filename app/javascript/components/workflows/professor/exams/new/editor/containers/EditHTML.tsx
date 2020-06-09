import EditHTML from '@professor/exams/new/editor/components/EditHTML';
import { connect } from 'react-redux';
import {
  MSTP,
  MDTP,
  ExamEditorState,
} from '@professor/exams/new/types';
import { HTMLVal } from '@student/exams/show/types';
import { editHtmlBodyItem } from '@professor/exams/new/actions';

interface OwnProps {
  qnum: number;
  pnum: number;
  bnum: number;
}

const mapStateToProps: MSTP<{
  value: HTMLVal;
}, OwnProps> = (state: ExamEditorState, ownProps) => {
  const { qnum, pnum, bnum } = ownProps;
  const { contents } = state;
  const b = contents.exam.questions[qnum].parts[pnum].body[bnum];
  return {
    value: (b as HTMLVal),
  };
};

const mapDispatchToProps: MDTP<{
  onChange: (value: HTMLVal) => void;
}, OwnProps> = (dispatch, ownProps) => ({
  onChange: (value: HTMLVal): void => {
    const { qnum, pnum, bnum } = ownProps;
    dispatch(
      editHtmlBodyItem(
        qnum,
        pnum,
        bnum,
        value,
      ),
    );
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(EditHTML);
