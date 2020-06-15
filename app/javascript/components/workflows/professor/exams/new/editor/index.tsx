import React from 'react';
import { createMap } from '@student/exams/show/files';
import { ExamContext } from '@student/exams/show/context';
import {
  Form,
  Button,
  Alert,
} from 'react-bootstrap';
import {
  ExamVersion,
  RailsExamVersion,
  AnswersState,
  Policy,
} from '@student/exams/show/types';
import {
  reduxForm,
  InjectedFormProps,
  FormSection,
  Field,
  WrappedFieldProps,
} from 'redux-form';
import { Provider } from 'react-redux';
import store from './store';
import Name from './components/Name';
import Policies from './components/Policies';
import Instructions from './components/Instructions';

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

type WrappedInput<T> = React.ComponentType<{ value: T; onChange: (a: T) => void; }>;

function wrapInput<T>(Wrappee : WrappedInput<T>): React.FC<WrappedFieldProps> {
  return (props) => {
    const { input } = props;
    return (
      <Wrappee value={input.value} onChange={input.onChange} />
    );
  };
}

const ExamEditor: React.FC<InjectedFormProps<FormValues>> = (props) => {
  const {
    pristine,
    reset,
  } = props;
  return (
    <form
      onSubmit={() => {
        console.log('TODO');
      }}
    >
      <FormSection name="all">
        <Field name="name" component={wrapInput(Name)} />
        <Field name="policies" component={wrapInput(Policies)} />
        <FormSection name="exam">
          <Alert variant="info">
            <h3>Exam-wide information</h3>
            <Field name="instructions" component={wrapInput(Instructions)} />
          </Alert>
          {/* <Field name="reference" component={EditPolicies} /> */}
          {/* <Field name="files" component={EditPolicies} /> */}
        </FormSection>
        <Form.Group>
          <Button
            variant="danger"
            className={pristine && 'd-none'}
            onClick={reset}
          >
            Reset
          </Button>
        </Form.Group>
      </FormSection>
    </form>
  );
};

const ExamEditorForm = reduxForm({
  form: 'version-editor',
})(ExamEditor);
