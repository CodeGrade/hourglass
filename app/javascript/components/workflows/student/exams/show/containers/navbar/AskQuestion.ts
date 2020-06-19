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
  onSubmit: (courseID: number, examID: number, body: string) => void;
}> = (dispatch) => ({
  onSubmit: (courseID, examID, body): void => {
    dispatch(askQuestion(courseID, examID, body));
  },
});

const AskQuestionConnected = connect(mapStateToProps, mapDispatchToProps)(AskQuestion);
AskQuestionConnected.displayName = 'AskQuestionConnected';
export default AskQuestionConnected;
AskQuestion.whyDidYouRender = true;
