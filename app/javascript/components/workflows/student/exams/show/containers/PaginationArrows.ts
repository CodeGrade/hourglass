import { connect } from 'react-redux';
import {
  nextQuestion,
  prevQuestion,
} from '@student/exams/show/actions';
import PaginationArrows from '@student/exams/show/components/PaginationArrows';
import { MDTP, MSTP } from '@student/exams/show/types';

const mapStateToProps: MSTP<{
  show: boolean;
  hasNext: boolean;
  hasPrev: boolean;
}> = (state) => ({
  show: state.pagination.paginated,
  hasNext: state.pagination.page !== state.pagination.pageCoords.length - 1,
  hasPrev: state.pagination.page !== 0,
});

const mapDispatchToProps: MDTP<{
  next: () => void;
  prev: () => void;
}> = (dispatch) => ({
  next: (): void => {
    dispatch(nextQuestion());
  },
  prev: (): void => {
    dispatch(prevQuestion());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(PaginationArrows);
