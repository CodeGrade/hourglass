import { connect } from 'react-redux';
import {
  MSTP,
  MDTP,
  ProfQuestion,
} from '@student/exams/show/types';
import AskQuestion from '@student/exams/show/components/navbar/AskQuestion';
import { askQuestion } from '@student/exams/show/actions';

const mapStateToProps: MSTP<{
  questions: ProfQuestion[];
}> = (state) => ({
  questions: state.questions.questions,
});

const mapDispatchToProps: MDTP<{
  onSubmit: (examQuestionsUrl: string, body: string) => void;
}> = (dispatch) => ({
  onSubmit: (examQuestionsUrl, body): void => {
    dispatch(askQuestion(examQuestionsUrl, body));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(AskQuestion);
