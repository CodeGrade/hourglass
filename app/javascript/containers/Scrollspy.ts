import { connect } from 'react-redux';
import {
  ScrollspyTop as Top,
  ScrollspyBottom as Bottom,
} from '@hourglass/components/Scrollspy';
import { MDTP } from '@hourglass/types';
import { viewQuestion } from '@hourglass/actions';

const mapDispatchToProps: MDTP<{
  viewQuestion: (qnum: number, pnum?: number) => void;
}> = (dispatch) => ({
  viewQuestion: (qnum, pnum): void => {
    dispatch(viewQuestion(qnum, pnum));
  },
});

export const ScrollspyTop = connect(null, mapDispatchToProps)(Top);
export const ScrollspyBottom = connect(null, mapDispatchToProps)(Bottom);
