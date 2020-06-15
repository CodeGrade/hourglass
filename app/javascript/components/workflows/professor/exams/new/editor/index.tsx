import React from 'react';
import { createMap } from '@student/exams/show/files';
import { ExamContext } from '@student/exams/show/context';
import {
  ExamVersion,
  RailsExamVersion,
  AnswersState,
  Policy,
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
    answers,
    railsExamVersion,
  } = props;
  const {
    files,
  } = exam;
  const fmap = createMap(files);

  return (
    <ExamContext.Provider value={{ files, fmap }}>
      <Provider store={store}>
        <ExamEditorForm
          initialValues={{
            all: {
              name: railsExamVersion.name,
              policies: railsExamVersion.policies,
              exam,
              answers,
            },
          }}
        />
      </Provider>
    </ExamContext.Provider>
  );
};
export default Editor;

interface FormValues {
  all: {
    name: string;
    policies: Policy[];
    exam: ExamVersion;
    answers: AnswersState;
  };
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
