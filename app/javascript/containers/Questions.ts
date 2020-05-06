import { connect } from 'react-redux';
import { ExamTakerState, MSTP } from '@hourglass/types';
import Questions from '@hourglass/components/Questions';

const mapStateToProps: MSTP<{
  paginated: boolean;
  selectedQuestion: number;
}> = (state: ExamTakerState) => ({
  paginated: state.contents.pagination.paginated,
  selectedQuestion: state.contents.pagination.selected.question,
});

export default connect(mapStateToProps, null)(Questions);
