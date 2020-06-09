import Policies from '@professor/exams/new/editor/components/Policies';
import { connect } from 'react-redux';
import {
  MSTP,
  MDTP,
  ExamEditorState,
} from '@professor/exams/new/types';
import { updatePolicies } from '@professor/exams/new/actions';
import { Policy } from '@student/exams/show/types';

const mapStateToProps: MSTP<{
  policies: Policy[];
}> = (state: ExamEditorState) => ({
  policies: state.policies,
});

const mapDispatchToProps: MDTP<{
  onChange: (policies: Policy[]) => void;
}> = (dispatch) => ({
  onChange: (policies: Policy[]): void => {
    dispatch(
      updatePolicies(
        policies,
      ),
    );
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Policies);
