import Question from '@professor/exams/new/editor/components/Question';
import { connect } from 'react-redux';
import {
  MSTP,
  MDTP,
  ExamEditorState,
} from '@professor/exams/new/types';
import { updateQuestion } from '@professor/exams/new/actions';
import {
  PartInfo,
  FileRef,
  ExamFile,
  HTMLVal,
} from '@student/exams/show/types';

interface OwnProps {
  qnum: number;
  numQuestions: number;
}

const mapStateToProps: MSTP<{
  name: HTMLVal;
  description: HTMLVal;
  separateSubparts: boolean;
  parts: PartInfo[];
  reference: FileRef[];
  files: ExamFile[];
}, OwnProps> = (state: ExamEditorState, ownProps) => {
  const { qnum } = ownProps;
  const { contents } = state;
  const q = contents.exam?.questions?.[qnum];
  return {
    name: q.name,
    description: q.description,
    separateSubparts: q.separateSubparts,
    parts: q.parts,
    reference: q.reference,
    files: contents.exam?.files,
  };
};

const mapDispatchToProps: MDTP<{
  onChange: (name: HTMLVal, description: HTMLVal, separateSubparts: boolean) => void;
}, OwnProps> = (dispatch, ownProps) => ({
  onChange: (name, description, separateSubparts): void => {
    const { qnum } = ownProps;
    dispatch(
      updateQuestion(
        qnum,
        name,
        description,
        separateSubparts,
      ),
    );
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Question);
