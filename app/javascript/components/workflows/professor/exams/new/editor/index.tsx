import React from 'react';
import { createMap } from '@student/exams/show/files';
import { ExamContext } from '@student/exams/show/context';
import {
  Form,
  Button,
  Row,
  Col,
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
import Policies from './components/Policies';

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

const EditPolicies: React.FC<WrappedFieldProps> = (props) => {
  const {
    input,
  } = props;
  const {
    onChange,
    value,
  } = input;
  return (
    <Policies policies={value} onChange={onChange} />
  );
};

const ExamName: React.FC<WrappedFieldProps> = (props) => {
  const {
    input,
  } = props;
  const {
    onChange,
    value,
  } = input;
  return (
    <Form.Group as={Row} controlId="examTitle">
      <Form.Label column sm="3"><h2>Version name:</h2></Form.Label>
      <Col>
        <Form.Control
          size="lg"
          type="text"
          placeholder="Enter a name for this version"
          value={value}
          onChange={onChange}
        />
      </Col>
    </Form.Group>
  );
};

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
        <Field name="name" component={ExamName} />
        <Field name="policies" component={EditPolicies} />
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
