import { connect } from 'react-redux';
import { ExamTakerState, MSTP, MDTP } from '@hourglass/types';
import ShowQuestion from '@hourglass/components/ShowQuestion';
import { spyQuestion } from '@hourglass/actions';

const mapStateToProps: MSTP<{
  paginated: boolean;
  selectedQuestion: number;
  selectedPart: number;
}> = (state: ExamTakerState) => ({
  paginated: state.pagination.paginated,
  selectedQuestion: state.pagination.selected.question,
  selectedPart: state.pagination.selected.part,
});

const mapDispatchToProps: MDTP<{
  spyQuestion: (qnum: number, pnum?: number) => void;
}> = (dispatch) => ({
  spyQuestion: (qnum: number, pnum?: number): void => {
    dispatch(spyQuestion(qnum, pnum));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ShowQuestion);
