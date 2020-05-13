import { connect } from 'react-redux';
import {
  viewQuestion,
} from '@hourglass/actions';
import PaginationArrows from '@hourglass/components/PaginationArrows';
import { MDTP } from '@hourglass/types';
import { scrollToQuestion, scrollToPart } from '@hourglass/helpers';

const mapDispatchToProps: MDTP<{
  onChange: (qnum: number, pnum?: number) => void;
}> = (dispatch) => ({
  onChange: (qnum, pnum): void => {
    dispatch(viewQuestion(qnum, pnum));
    if (pnum) {
      scrollToPart(qnum, pnum);
    } else {
      scrollToQuestion(qnum);
    }
  },
});

export default connect(null, mapDispatchToProps)(PaginationArrows);
