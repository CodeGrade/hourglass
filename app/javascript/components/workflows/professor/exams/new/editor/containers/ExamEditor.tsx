import ExamEditor from '@professor/exams/new/editor/components/ExamEditor';
import { connect } from 'react-redux';
import {
  MSTP,
  MDTP,
  ExamEditorState,
} from '@professor/exams/new/types';
import { updateTitle } from '@professor/exams/new/actions';
import { ExamVersion } from '@student/exams/show/types';

const mapStateToProps: MSTP<{
  name: string;
  version: ExamVersion;
}> = (state: ExamEditorState) => ({
  name: state.name,
  version: state.contents.exam,
});

const mapDispatchToProps: MDTP<{
  onChange: (name: string) => void;
}> = (dispatch) => ({
  onChange: (name: string): void => {
    dispatch(
      updateTitle(
        name,
      ),
    );
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ExamEditor);
