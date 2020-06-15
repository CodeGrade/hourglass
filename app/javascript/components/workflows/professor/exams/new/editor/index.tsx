import React, { useContext } from 'react';
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
  ExamFile,
} from '@student/exams/show/types';
import {
  reduxForm,
  InjectedFormProps,
  FormSection,
  Field,
  WrappedFieldProps,
  formValueSelector,
  FieldArray,
} from 'redux-form';
import { Provider, connect } from 'react-redux';
import { Version, versionUpdate } from '@hourglass/common/api/professor/exams/versions/update';
import { useParams, useHistory } from 'react-router-dom';
import { AlertContext } from '@hourglass/common/alerts';
import store from '@professor/exams/new/editor/store';
import Name from '@professor/exams/new/editor/components/Name';
import Policies from '@professor/exams/new/editor/components/Policies';
import Instructions from '@professor/exams/new/editor/components/Instructions';
import Reference from '@professor/exams/new/editor/components/Reference';
import FileUploader from '@professor/exams/new/editor/components/FileUploader';
import ShowQuestions from '@professor/exams/new/editor/components/ShowQuestions';

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
  return (
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

const formSelector = formValueSelector('version-editor');

const FormContextProvider: React.FC<{
  files: ExamFile[];
}> = (props) => {
  const {
    files,
    children,
  } = props;
  const fmap = createMap(files);
  return (
    <ExamContext.Provider
      value={{
        files,
        fmap,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};

const FormContextProviderConnected = connect((state) => ({
  files: formSelector(state, 'all.exam.files'),
}))(FormContextProvider);

const ExamEditor: React.FC<InjectedFormProps<FormValues>> = (props) => {
  const {
    pristine,
    reset,
    handleSubmit,
  } = props;
  const { alert } = useContext(AlertContext);
  const history = useHistory();
  const { examId, versionId } = useParams();
  return (
    <form
      onSubmit={handleSubmit(({ all }) => {
        const version: Version = {
          name: all.name,
          info: {
            policies: all.policies,
            answers: all.answers.answers,
            contents: {
              instructions: all.exam.instructions,
              questions: all.exam.questions,
              reference: all.exam.reference ?? [],
            },
          },
          files: all.exam.files,
        };
        versionUpdate(versionId, { version }).then((res) => {
          if (res.updated === false) {
            alert({
              variant: 'danger',
              title: 'Exam version not updated.',
              message: <pre>{res.reason}</pre>,
            });
          } else {
            history.push(`/exams/${examId}/admin`);
            alert({
              variant: 'success',
              message: 'Exam version updated successfully.',
            });
          }
        });
      })}
    >
      <FormSection name="all">
        <Field name="name" component={wrapInput(Name)} />
        <Field name="policies" component={wrapInput(Policies)} />
        <FormSection name="exam">
          <FormContextProviderConnected>
            <Alert variant="info">
              <h3>Exam-wide information</h3>
              <Field name="files" component={wrapInput(FileUploader)} />
              <Field name="instructions" component={wrapInput(Instructions)} />
            </Alert>
            <Field name="reference" component={wrapInput(Reference)} />
            <FieldArray name="questions" component={ShowQuestions} />
          </FormContextProviderConnected>
        </FormSection>
        <div className="my-2 float-right">
          <Button
            variant="danger"
            className={pristine && 'd-none'}
            onClick={reset}
          >
            Reset
          </Button>
          <Button
            variant="success"
            type="submit"
          >
            Submit
          </Button>
        </div>
      </FormSection>
    </form>
  );
};

const ExamEditorForm = reduxForm({
  form: 'version-editor',
})(ExamEditor);
