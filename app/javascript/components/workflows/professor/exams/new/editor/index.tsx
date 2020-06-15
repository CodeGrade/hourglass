import React from 'react';
import { createMap } from '@student/exams/show/files';
import { ExamContext } from '@student/exams/show/context';
import {
  ExamVersion,
  RailsExamVersion,
  AnswersState,
} from '@student/exams/show/types';
import {
  reduxForm,
  InjectedFormProps,
} from 'redux-form';
import { Provider } from 'react-redux';
import store from './store';

export interface ExamEditorProps {
  exam: ExamVersion;
  railsExamVersion: RailsExamVersion;
  answers: AnswersState;
}

const Editor: React.FC<ExamEditorProps> = (props) => {
  const {
    exam,
  } = props;
  const {
    files,
  } = exam;
  const fmap = createMap(files);

  return (
    <ExamContext.Provider value={{ files, fmap }}>
      <Provider store={store}>
        <ExamEditorForm />
      </Provider>
    </ExamContext.Provider>
  );
};
export default Editor;

interface FormValues {
  // TODO
}

const ExamEditor: React.FC<InjectedFormProps<FormValues>> = (props) => {
  console.log(props);
  return (
    <p>
      Exam Editor here
    </p>
  );
};

const ExamEditorForm = reduxForm({
  form: 'version-editor',
})(ExamEditor);
