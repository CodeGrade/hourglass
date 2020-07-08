import { connect } from 'react-redux';
import {
  MSTP,
  MDTP,
  ProfQuestion,
} from '@student/exams/show/types';
import AskQuestion from '@student/exams/show/components/navbar/AskQuestion';
import { askQuestion } from '@student/exams/show/actions';

interface OwnProps {
  examQuestionsUrl: string;
}

const mapStateToProps: MSTP<{
  questions: ProfQuestion[];
}, OwnProps> = (state) => ({
  questions: state.questions.questions,
});

const mapDispatchToProps: MDTP<{
  onSubmit: (body: string) => void;
}, OwnProps> = (dispatch, ownProps) => ({
  onSubmit: (body): void => {
    dispatch(askQuestion(ownProps.examQuestionsUrl, body));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(AskQuestion);
