import { connect } from 'react-redux';
import { ExamTakerState, MSTP, MDTP } from '@hourglass/types';
import ShowQuestion from '@hourglass/components/ShowQuestion';
import { spyQuestion } from '@hourglass/actions';

const mapStateToProps: MSTP<{
  paginated: boolean;
  selectedQuestion: number;
  selectedPart: number;
}> = (state: ExamTakerState) => {
  const { coords, paginated, selected } = state.pagination;
  return {
    paginated,
    selectedQuestion: coords[selected].question,
    selectedPart: coords[selected].part,
  };
};

const mapDispatchToProps: MDTP<{
  spyQuestion: (question: number, pnum?: number) => void;
}> = (dispatch) => ({
  spyQuestion: (question, part): void => {
    dispatch(spyQuestion({ question, part }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ShowQuestion);
