import { connect } from 'react-redux';
import { ExamTakerState, MSTP } from '@hourglass/types';
import Questions from '@hourglass/components/Questions';

const mapStateToProps: MSTP<{
  paginated: boolean;
  selectedQuestion: number;
}> = (state: ExamTakerState) => ({
  paginated: state.pagination.paginated,
  selectedQuestion: state.pagination.selected.question,
});

export default connect(mapStateToProps, null)(Questions);
