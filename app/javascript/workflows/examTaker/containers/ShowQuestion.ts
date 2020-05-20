import { connect } from 'react-redux';
import { ExamTakerState, MSTP, MDTP } from '@examTaker/types';
import ShowQuestion from '@examTaker/components/ShowQuestion';
import { spyQuestion } from '@examTaker/actions';

const mapStateToProps: MSTP<{
  paginated: boolean;
  selectedQuestion: number;
  selectedPart: number;
}> = (state: ExamTakerState) => {
  const { pageCoords, paginated, page } = state.pagination;
  return {
    paginated,
    selectedQuestion: pageCoords[page].question,
    selectedPart: pageCoords[page].part,
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
