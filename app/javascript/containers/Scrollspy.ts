import { connect } from 'react-redux';
import {
  ScrollspyTop as Top,
  ScrollspyBottom as Bottom,
} from '@hourglass/components/Scrollspy';
import { MDTP, MSTP } from '@hourglass/types';
import { spyQuestion } from '@hourglass/actions';

const mapStateToProps: MSTP<{
  paginated: boolean;
  selectedQuestion: number;
}> = (state) => ({
  paginated: state.pagination.paginated,
  selectedQuestion: state.pagination.selected.question,
});

const mapDispatchToProps: MDTP<{
  spyQuestion: (qnum: number, pnum?: number) => void;
}> = (dispatch) => ({
  spyQuestion: (qnum, pnum): void => {
    dispatch(spyQuestion(qnum, pnum));
  },
});

export const ScrollspyTop = connect(mapStateToProps, mapDispatchToProps)(Top);
export const ScrollspyBottom = connect(mapStateToProps, mapDispatchToProps)(Bottom);
