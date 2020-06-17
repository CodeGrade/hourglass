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
  ExamVersionWithAnswers,
  QuestionInfo,
  PartInfo,
  BodyItem,
  QuestionInfoWithAnswers,
  PartInfoWithAnswers,
  BodyItemWithAnswer,
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
import { isNoAns } from '@hourglass/workflows/student/exams/show/containers/questions/connectors';

export interface ExamEditorProps {
  exam: ExamVersion;
  railsExamVersion: RailsExamVersion;
  answers: AnswersState;
}

function examWithAnswers(exam: ExamVersion, answers: AnswersState['answers']): ExamVersionWithAnswers {
  const {
    questions,
    ...restOfE
  } = exam;
  const newQuestions: QuestionInfoWithAnswers[] = [];
  questions.forEach((q, qnum) => {
    const {
      parts,
      ...restOfQ
    } = q;
    const newParts: PartInfoWithAnswers[] = [];
    parts.forEach((p, pnum) => {
      const {
        body,
        ...restOfP
      } = p;
      const newBody: BodyItemWithAnswer[] = [];
      body.forEach((b, bnum) => {
        const ans = answers[qnum][pnum][bnum];
        const newBodyItem: BodyItemWithAnswer = {
          ...b,
          answer: isNoAns(ans) ? undefined : ans,
        } as BodyItemWithAnswer;
        newBody.push(newBodyItem);
      });
      newParts.push({
        ...restOfP,
        body: newBody,
      });
    });
    newQuestions.push({
      ...restOfQ,
      parts: newParts,
    });
  });
  return {
    ...restOfE,
    questions: newQuestions,
  };
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
            exam: examWithAnswers(exam, answers.answers),
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
    exam: ExamVersionWithAnswers;
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

function transformForSubmit(values: FormValues): Version {
  const { all } = values;
  const questions: QuestionInfo[] = [];
  const answers: AnswersState['answers'] = [];
  all.exam.questions.forEach((q, qnum) => {
    answers[qnum] = [];
    const {
      parts,
      ...restOfQ
    } = q;
    const newParts: PartInfo[] = [];
    parts.forEach((p, pnum) => {
      answers[qnum][pnum] = [];
      const {
        body,
        ...restOfP
      } = p;
      const newBody: BodyItem[] = [];
      body.forEach((b, bnum) => {
        const {
          answer,
          ...restOfB
        } = b;
        answers[qnum][pnum][bnum] = answer ?? { NO_ANS: true };
        newBody.push({
          ...restOfB,
        });
      });
      newParts.push({
        ...restOfP,
        body: newBody,
      });
    });
    questions.push({
      ...restOfQ,
      parts: newParts,
    });
  });

  return {
    name: all.name,
    info: {
      policies: all.policies,
      answers,
      contents: {
        instructions: all.exam.instructions,
        questions,
        reference: all.exam.reference ?? [],
      },
    },
    files: all.exam.files,
  };
}

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
      onSubmit={handleSubmit((values) => {
        const version = transformForSubmit(values);
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
