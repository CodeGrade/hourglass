import { connect } from 'react-redux';
import JumpTo from '@student/exams/show/components/navbar/JumpTo';
import {
  MSTP, PaginationState, QuestionInfo, MDTP,
} from '@student/exams/show/types';
import {
  togglePagination,
  viewQuestion,
  spyQuestion,
  activateWaypoints,
} from '@student/exams/show/actions';

const mapStateToProps: MSTP<{
  pagination: PaginationState;
  questions: readonly QuestionInfo[];
}> = (state) => ({
  pagination: state.pagination,
  questions: state.contents.exam.questions,
});

const mapDispatchToProps: MDTP<{
  togglePagination: () => void;
  changeQuestion: (q: number, part?: number) => void;
  spyQuestion: (q: number, part?: number) => void;
}> = (dispatch) => ({
  togglePagination: (): void => {
    dispatch(activateWaypoints(false));
    dispatch(togglePagination());

    // Double setTimeout to mask waypoints until scrolling is really finished.
    setTimeout(() => setTimeout(() => dispatch(activateWaypoints(true))));
  },
  changeQuestion: (question: number, part?: number): void => {
    dispatch(activateWaypoints(false));
    dispatch(viewQuestion({ question, part }));
    setTimeout(() => setTimeout(() => dispatch(activateWaypoints(true))));
  },
  spyQuestion: (question: number, part?: number): void => {
    dispatch(spyQuestion({ question, part }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(JumpTo);
