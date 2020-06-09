import Part from '@professor/exams/new/editor/components/Part';
import { connect } from 'react-redux';
import {
  MSTP,
  MDTP,
  ExamEditorState,
} from '@professor/exams/new/types';
import { updatePart } from '@professor/exams/new/actions';
import { FileRef, ExamFile, HTMLVal } from '@student/exams/show/types';

interface OwnProps {
  qnum: number;
  pnum: number;
  numParts: number;
}

const mapStateToProps: MSTP<{
  name: HTMLVal;
  description: HTMLVal;
  points: number;
  reference: FileRef[];
  files: ExamFile[];
}, OwnProps> = (state: ExamEditorState, ownProps) => {
  const { qnum, pnum } = ownProps;
  const { contents } = state;
  const p = contents.exam.questions[qnum].parts[pnum];
  return {
    name: p.name ?? {
      type: 'HTML',
      value: '',
    },
    description: p.description ?? {
      type: 'HTML',
      value: '',
    },
    points: p.points ?? 0,
    reference: p.reference,
    files: contents.exam?.files,
  };
};

const mapDispatchToProps: MDTP<{
  onChange: (name: HTMLVal, description: HTMLVal, points: number) => void;
}, OwnProps> = (dispatch, ownProps) => ({
  onChange: (name, description, points): void => {
    const { qnum, pnum } = ownProps;
    dispatch(
      updatePart(
        qnum,
        pnum,
        name,
        description,
        points,
      ),
    );
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Part);
