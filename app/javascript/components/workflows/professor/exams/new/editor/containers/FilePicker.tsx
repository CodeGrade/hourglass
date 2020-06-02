import FilePicker from '@professor/exams/new/editor/components/FilePicker';
import { connect } from 'react-redux';
import {
  MSTP,
  MDTP,
  ExamEditorState,
} from '@professor/exams/new/types';
import {
  updateExamFileRefs,
  updateQuestionFileRefs,
  updatePartFileRefs,
} from '@professor/exams/new/actions';
import {
  FileRef,
  ExamFile,
} from '@student/exams/show/types';

const mapStateToPropsExam: MSTP<{
  options: ExamFile[];
  selected: FileRef[];
}, {}> = (state: ExamEditorState, _ownProps) => ({
  options: state.contents.exam.files,
  selected: state.contents.exam.reference,
});

const mapDispatchToPropsExam: MDTP<{
  onChange: (fileRefs: FileRef[]) => void;
}, {}> = (dispatch, _ownProps) => ({
  onChange: (fileRefs: FileRef[]): void => {
    dispatch(
      updateExamFileRefs(
        fileRefs,
      ),
    );
  },
});

const mapStateToPropsQuestion: MSTP<{
  options: ExamFile[];
  selected: FileRef[];
}, { qnum: number }> = (state: ExamEditorState, ownProps) => {
  const { qnum } = ownProps;
  return {
    options: state.contents.exam.files,
    selected: state.contents.exam.questions[qnum].reference,
  };
};

const mapDispatchToPropsQuestion: MDTP<{
  onChange: (fileRefs: FileRef[]) => void;
}, { qnum: number }> = (dispatch, ownProps) => ({
  onChange: (fileRefs: FileRef[]): void => {
    const { qnum } = ownProps;
    dispatch(
      updateQuestionFileRefs(
        qnum,
        fileRefs,
      ),
    );
  },
});

const mapStateToPropsPart: MSTP<{
  options: ExamFile[];
  selected: FileRef[];
}, { qnum: number; pnum: number }> = (state: ExamEditorState, ownProps) => {
  const { qnum, pnum } = ownProps;
  return {
    options: state.contents.exam.files,
    selected: state.contents.exam.questions[qnum].parts[pnum].reference,
  };
};

const mapDispatchToPropsPart: MDTP<{
  onChange: (fileRefs: FileRef[]) => void;
}, { qnum: number; pnum: number }> = (dispatch, ownProps) => ({
  onChange: (fileRefs: FileRef[]): void => {
    const { qnum, pnum } = ownProps;
    dispatch(
      updatePartFileRefs(
        qnum,
        pnum,
        fileRefs,
      ),
    );
  },
});

export const FilePickerExam = connect(mapStateToPropsExam, mapDispatchToPropsExam)(FilePicker);
export const FilePickerQuestion = connect(
  mapStateToPropsQuestion,
  mapDispatchToPropsQuestion,
)(FilePicker);
export const FilePickerPart = connect(mapStateToPropsPart, mapDispatchToPropsPart)(FilePicker);
