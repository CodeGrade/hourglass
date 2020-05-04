import { connect } from 'react-redux';
import { ExamTakerState } from '@hourglass/types';
import Questions from '@hourglass/components/Questions';

function mapStateToProps(state: ExamTakerState) {
  return {
    paginated: state.contents.pagination.paginated,
    selectedQuestion: state.contents.pagination.selected.question,
  };
}

export default connect(mapStateToProps, null)(Questions);
