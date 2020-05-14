import { connect } from 'react-redux';
import { MSTP, MDTP } from '@hourglass/types';
import { spyQuestion } from '@hourglass/actions';

const mapStateToProps: MSTP<{
  paginated: boolean;
  selectedQuestion: number;
  selectedPart: number;
  waypointsActive: boolean;
}> = (state) => {
  const {
    paginated,
    pageCoords,
    page,
    waypointsActive,
  } = state.pagination;
  return {
    paginated,
    selectedQuestion: pageCoords[page].question,
    selectedPart: pageCoords[page].part,
    waypointsActive,
  };
};

const mapDispatchToProps: MDTP<{
  spy: (question: number, pnum?: number) => void;
}> = (dispatch) => ({
  spy: (question, part): void => {
    dispatch(spyQuestion({ question, part }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps);
