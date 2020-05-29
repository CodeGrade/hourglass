import FileUploader from '@professor/exams/new/editor/components/FileUploader';
import { connect } from 'react-redux';
import {
  MSTP,
  MDTP,
  ExamEditorState,
} from '@professor/exams/new/types';
import { ExamFile } from '@student/exams/show/types';
import { updateExamFiles } from '@professor/exams/new/actions';


const mapStateToProps: MSTP<{
  files: ExamFile[];
}, {}> = (state: ExamEditorState, _ownProps) => {
  const { files } = state.contents.exam;
  return { files };
};

const mapDispatchToProps: MDTP<{
  onChange: (files: ExamFile[]) => void;
}, {}> = (dispatch, _ownProps) => (
  {
    onChange: (files: ExamFile[]): void => { dispatch(updateExamFiles(files)); },
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(FileUploader);
