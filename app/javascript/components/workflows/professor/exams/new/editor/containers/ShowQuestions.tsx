import ShowQuestions from '@professor/exams/new/editor/components/ShowQuestions';
import { connect } from 'react-redux';
import {
  MSTP,
  MDTP,
  ExamEditorState,
} from '@professor/exams/new/types';
import { addQuestion } from '@professor/exams/new/actions';
import { QuestionInfo } from '@student/exams/show/types';


const mapStateToProps: MSTP<{
  numQuestions: number;
}> = (state: ExamEditorState) => {
  const { contents } = state;
  return {
    numQuestions: contents.exam.questions.length,
  };
};

const mapDispatchToProps: MDTP<{
  addQuestion: (qnum: number, question: QuestionInfo) => void;
}> = (dispatch) => ({
  addQuestion: (qnum: number, question: QuestionInfo): void => {
    dispatch(addQuestion(qnum, question));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ShowQuestions);
