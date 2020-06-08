import ExamEditor from '@professor/exams/new/editor/components/ExamEditor';
import { connect } from 'react-redux';
import {
  MSTP,
  MDTP,
  ExamEditorState,
} from '@professor/exams/new/types';
import { updateTitle } from '@professor/exams/new/actions';
import {
  Exam,
  RailsExam,
  ExamFile,
  AnswersState,
} from '@student/exams/show/types';

const mapStateToProps: MSTP<{
  exam: Exam;
  railsExam: RailsExam;
  files: ExamFile[];
  answers: AnswersState;
}> = (state: ExamEditorState) => ({
  exam: state.contents.exam,
  railsExam: state.railsExam,
  files: state.contents.exam.files,
  answers: state.contents.answers,
});

const mapDispatchToProps: MDTP<{
  onChange: (name: string) => void;
}> = (dispatch) => ({
  onChange: (name: string): void => {
    dispatch(
      updateTitle(
        name,
      ),
    );
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ExamEditor);
