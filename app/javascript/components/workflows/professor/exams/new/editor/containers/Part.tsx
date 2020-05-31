import Part from '@professor/exams/new/editor/components/Part';
import { connect } from 'react-redux';
import {
  MSTP,
  MDTP,
  ExamEditorState,
} from '@professor/exams/new/types';
import { updatePart } from '@professor/exams/new/actions';
import { FileRef, ExamFile } from '@student/exams/show/types';

interface OwnProps {
  qnum: number;
  pnum: number;
  numParts: number;
}

const mapStateToProps: MSTP<{
  name: string;
  description: string;
  points: number;
  reference: FileRef[];
  files: ExamFile[];
}, OwnProps> = (state: ExamEditorState, ownProps) => {
  const { qnum, pnum } = ownProps;
  const { contents } = state;
  const p = contents.exam.questions[qnum].parts[pnum];
  return {
    name: p.name ?? '',
    description: p.description ?? '',
    points: p.points ?? 0,
    reference: p.reference,
    files: contents.exam?.files,
  };
};

const mapDispatchToProps: MDTP<{
  onChange: (name: string, description: string, points: number) => void;
}, OwnProps> = (dispatch, ownProps) => ({
  onChange: (name: string, description: string, points: number): void => {
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
