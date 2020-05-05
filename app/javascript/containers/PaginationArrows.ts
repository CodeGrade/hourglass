import { connect } from 'react-redux';
import {
  viewNextQuestion,
  viewPrevQuestion,
} from '@hourglass/actions';
import PaginationArrows from '@hourglass/components/PaginationArrows';
import { MDTP } from '@hourglass/types';

const mapDispatchToProps: MDTP<{
  onBack: () => void;
  onNext: () => void;
}> = (dispatch) => ({
  onBack: (): void => {
    dispatch(viewPrevQuestion());
  },
  onNext: (): void => {
    dispatch(viewNextQuestion());
  },
});

export default connect(null, mapDispatchToProps)(PaginationArrows);
