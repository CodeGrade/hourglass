import { connect } from 'react-redux';
import JumpTo from '@hourglass/components/navbar/JumpTo';
import {
  MSTP, PaginationState, QuestionInfo, MDTP,
} from '@hourglass/types';
import {
  togglePagination,
  viewQuestion,
} from '@hourglass/actions';

const mapStateToProps: MSTP<{
  pagination: PaginationState;
  questions: QuestionInfo[];
}> = (state) => ({
  pagination: state.contents.pagination,
  questions: state.contents.data.exam.questions,
});

const mapDispatchToProps: MDTP<{
  togglePagination: () => void;
  changeQuestion: (q: number, part?: number) => void;
}> = (dispatch) => ({
  togglePagination: (): void => {
    dispatch(togglePagination());
  },
  changeQuestion: (question: number, part?: number): void => {
    dispatch(viewQuestion(question, part));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(JumpTo);
