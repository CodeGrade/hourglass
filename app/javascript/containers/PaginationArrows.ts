import { connect } from 'react-redux';
import {
  nextQuestion,
  prevQuestion,
} from '@hourglass/actions';
import PaginationArrows from '@hourglass/components/PaginationArrows';
import { MDTP, MSTP } from '@hourglass/types';

const mapStateToProps: MSTP<{
  show: boolean;
  hasNext: boolean;
  hasPrev: boolean;
}> = (state) => ({
  show: state.pagination.paginated,
  hasNext: state.pagination.selected !== state.pagination.coords.length - 1,
  hasPrev: state.pagination.selected !== 0,
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
