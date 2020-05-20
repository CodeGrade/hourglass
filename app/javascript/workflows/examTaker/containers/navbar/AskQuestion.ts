import { connect } from 'react-redux';
import {
  MSTP,
  MDTP,
  ProfQuestion,
} from '@examTaker/types';
import AskQuestion from '@examTaker/components/navbar/AskQuestion';
import { askQuestion } from '@examTaker/actions';

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
