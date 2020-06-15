import React, { useContext } from 'react';
import { createMap } from '@student/exams/show/files';
import { ExamContext, ExamFilesContext } from '@student/exams/show/context';
import {
  Button,
  Alert,
} from 'react-bootstrap';
import {
  ExamVersion,
  RailsExamVersion,
  AnswersState,
  Policy,
  ExamFile,
  FileRef,
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

const WrappedName = wrapInput(Name);
const WrappedPolicies = wrapInput(Policies);
const WrappedFileUploader = wrapInput(FileUploader);
const WrappedInstructions = wrapInput(Instructions);
const WrappedReference = wrapInput(Reference);

export const formSelector = formValueSelector('version-editor');

const FormContextProvider: React.FC<{
  files: ExamFile[];
  examRef: FileRef[];
}> = (props) => {
  const {
    files,
    examRef,
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
      <ExamFilesContext.Provider
        value={{
          references: examRef,
        }}
      >
        {children}
      </ExamFilesContext.Provider>
    </ExamContext.Provider>
  );
};

const FormContextProviderConnected = connect((state) => ({
  files: formSelector(state, 'all.exam.files'),
  examRef: formSelector(state, 'all.exam.reference'),
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
        <Field name="name" component={WrappedName} />
        <Field name="policies" component={WrappedPolicies} />
        <FormSection name="exam">
          <FormContextProviderConnected>
            <Alert variant="info">
              <h3>Exam-wide information</h3>
              <Field name="files" component={WrappedFileUploader} />
              <Field name="instructions" component={WrappedInstructions} />
            </Alert>
            <Field name="reference" component={WrappedReference} />
            <FieldArray name="questions" component={ShowQuestions} />
          </FormContextProviderConnected>
        </FormSection>
        <div className="my-2 float-right">
          <Button
            variant="danger"
            className={pristine ? 'd-none' : 'mr-2'}
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
