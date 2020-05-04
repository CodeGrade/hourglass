import { connect } from 'react-redux';
import {
  viewNextQuestion,
  viewPrevQuestion,
} from '@hourglass/actions';
import PaginationArrows from '@hourglass/components/PaginationArrows';

function mapDispatchToProps(dispatch) {
  return {
    onBack: () => {
      dispatch(viewPrevQuestion());
    },
    onNext: () => {
      dispatch(viewNextQuestion());
    },
  }
}

export default connect(null, mapDispatchToProps)(PaginationArrows);
