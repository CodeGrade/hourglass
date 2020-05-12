import { connect } from 'react-redux';
import {
  MSTP,
  MDTP,
  ProfQuestion,
} from '@hourglass/types';
import AskQuestion from '@hourglass/components/navbar/AskQuestion';
import { askQuestion } from '@hourglass/actions';

const mapStateToProps: MSTP<{
  questions: ProfQuestion[];
}> = (state) => ({
  questions: state.questions.questions,
});

const mapDispatchToProps: MDTP<{
  onSubmit: (examID: number, body: string) => void;
}> = (dispatch) => ({
  onSubmit: (examID, body): void => {
    dispatch(askQuestion(examID, body));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(AskQuestion);
