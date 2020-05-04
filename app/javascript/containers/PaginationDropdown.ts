import { connect } from 'react-redux';
import PaginationDropdown from '@hourglass/components/PaginationDropdown';
import {
  ExamTakerState,
} from '@hourglass/types';
import {
  togglePagination,
  viewQuestion,
} from '@hourglass/actions';

function mapStateToProps(state: ExamTakerState) {
  return {
    pagination: state.contents.pagination,
    questions: state.contents.exam.info.questions,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    togglePagination: () => {
      dispatch(togglePagination());
    },
    changeQuestion: (question: number, part?: number) => {
      dispatch(viewQuestion(question, part));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PaginationDropdown);
