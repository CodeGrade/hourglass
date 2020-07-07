import React, { useContext, useEffect } from 'react';
import { createMap } from '@student/exams/show/files';
import { ExamContext, ExamFilesContext } from '@student/exams/show/context';
import {
  Button,
  Alert,
  Form,
  Row,
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
  AllThatApplyState,
  AllThatApplyInfo,
  AllThatApplyInfoWithAnswer,
  AnswerState,
  MatchingInfoWithAnswer,
  MatchingInfo,
  MatchingState,
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
import { useParams, useHistory } from 'react-router-dom';
import { AlertContext } from '@hourglass/common/alerts';
import store from '@professor/exams/new/editor/store';
import Name from '@professor/exams/new/editor/components/Name';
import Policies from '@professor/exams/new/editor/components/Policies';
import Instructions from '@professor/exams/new/editor/components/Instructions';
import EditReference from '@professor/exams/new/editor/components/Reference';
import FileUploader from '@professor/exams/new/editor/components/FileUploader';
import ShowQuestions from '@professor/exams/new/editor/components/ShowQuestions';
import { isNoAns } from '@student/exams/show/containers/questions/connectors';
import { useMutation, graphql } from 'relay-hooks';

export interface Version {
  name: string;
  info: {
    policies: RailsExamVersion['policies'];
    answers: AnswersState['answers'];
    contents: {
      instructions: ExamVersion['instructions'];
      questions: ExamVersion['questions'];
      reference: ExamVersion['reference'];
    };
  };
  files: ExamVersion['files'];
}

export interface ExamEditorProps {
  examVersionId: string;
  exam: ExamVersion;
  railsExamVersion: RailsExamVersion;
  answers: AnswersState;
}

function transformATAReverse(
  ata: AllThatApplyInfo,
  answer: AllThatApplyState,
): AllThatApplyInfoWithAnswer {
  const {
    options,
    ...rest
  } = ata;
  const newOptions = options.map((o, idx) => ({
    html: o,
    answer: answer[idx],
  }));
  return {
    ...rest,
    options: newOptions,
  };
}

function transformMatchingReverse(
  matching: MatchingInfo,
  answer: MatchingState,
): MatchingInfoWithAnswer {
  const {
    prompts,
    ...rest
  } = matching;
  const newPrompts = prompts.map((o, idx) => ({
    html: o,
    answer: answer[idx],
  }));
  return {
    ...rest,
    prompts: newPrompts,
  };
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
        let newItem: BodyItemWithAnswer;
        switch (b.type) {
          case 'AllThatApply': {
            newItem = transformATAReverse(b, ans as AllThatApplyState);
            break;
          }
          case 'Matching': {
            newItem = transformMatchingReverse(b, ans as MatchingState);
            break;
          }
          default:
            newItem = {
              ...b,
              answer: isNoAns(ans) ? undefined : ans,
            } as BodyItemWithAnswer;
        }
        newBody.push(newItem);
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
    examVersionId,
    exam,
    answers,
    railsExamVersion,
  } = props;
  return (
    <Provider store={store}>
      <ExamEditorForm
        examVersionId={examVersionId}
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
    policies: readonly Policy[];
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

function transformATA(
  ata: AllThatApplyInfoWithAnswer,
): {
  info: AllThatApplyInfo,
  answer: AllThatApplyState,
} {
  const {
    options,
    ...rest
  } = ata;
  const answer = [];
  const newOptions = [];
  options.forEach((o) => {
    answer.push(o.answer);
    newOptions.push(o.html);
  });
  return {
    info: {
      ...rest,
      options: newOptions,
    },
    answer,
  };
}

function transformMatching(
  matching: MatchingInfoWithAnswer,
): {
  info: MatchingInfo,
  answer: MatchingState,
} {
  const {
    prompts,
    ...rest
  } = matching;
  const answer = [];
  const newPrompts = [];
  prompts.forEach((o) => {
    answer.push(o.answer);
    newPrompts.push(o.html);
  });
  return {
    info: {
      ...rest,
      prompts: newPrompts,
    },
    answer,
  };
}

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
        let itemAnswer: AnswerState;
        let bodyItem: BodyItem;
        switch (b.type) {
          case 'AllThatApply': {
            const res = transformATA(b);
            itemAnswer = res.answer;
            bodyItem = res.info;
            break;
          }
          case 'Matching': {
            const res = transformMatching(b);
            itemAnswer = res.answer;
            bodyItem = res.info;
            break;
          }
          default: {
            const {
              answer,
              ...restOfB
            } = b;
            itemAnswer = answer;
            bodyItem = restOfB;
          }
        }
        answers[qnum][pnum][bnum] = itemAnswer ?? { NO_ANS: true };
        newBody.push(bodyItem);
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

const UPDATE_EXAM_VERSION = graphql`
mutation editorUpdateExamVersionMutation($input: UpdateExamVersionInput!) {
  updateExamVersion(input: $input) {
    examVersion {
      id
    }
  }
}
`;

interface ExamEditorExtraProps {
  examVersionId: string;
}

const ExamEditor: React.FC<
  InjectedFormProps<FormValues, ExamEditorExtraProps> & ExamEditorExtraProps
> = (props) => {
  const {
    examVersionId,
    pristine,
    reset,
    handleSubmit,
  } = props;
  const { alert } = useContext(AlertContext);
  const history = useHistory();
  const { examId, versionId: versionRailsId } = useParams();
  const [update, { loading: saveLoading }] = useMutation(
    UPDATE_EXAM_VERSION,
    {
      onCompleted: () => {
        history.push(`/exams/${examId}/admin`);
        alert({
          variant: 'success',
          autohide: true,
          message: 'Exam version updated successfully.',
        });
      },
      onError: (errs) => {
        alert({
          variant: 'danger',
          title: 'Exam version not updated.',
          message: <pre>{errs[0]?.message}</pre>,
        });
      },
    },
  );
  const [autosave, { loading: autosaveLoading }] = useMutation(
    UPDATE_EXAM_VERSION,
    {
      onCompleted: () => {
        alert({
          variant: 'success',
          title: 'Autosaved',
          message: 'Exam version saved automatically.',
          autohide: true,
        });
      },
      onError: (errs) => {
        alert({
          variant: 'danger',
          title: 'Error doing autosave',
          message: <pre>{errs[0]?.message}</pre>,
          autohide: true,
        });
      },
    },
  );
  useEffect(() => {
    const timer = setInterval(() => {
      handleSubmit((values) => {
        const {
          name,
          info,
          files,
        } = transformForSubmit(values);
        autosave({
          variables: {
            input: {
              examVersionId,
              name,
              info: JSON.stringify(info),
              files: JSON.stringify(files),
            },
          },
        });
      })();
    }, 20000);
    return () => {
      clearInterval(timer);
    };
  }, [handleSubmit]);
  return (
    <form
      onSubmit={(e): void => {
        e.preventDefault();
        handleSubmit((values) => {
          const {
            name,
            info,
            files,
          } = transformForSubmit(values);
          update({
            variables: {
              input: {
                examVersionId,
                name,
                info: JSON.stringify(info),
                files: JSON.stringify(files),
              },
            },
          });
        })();
      }}
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
            <Form.Group as={Row}>
              <Field
                name="reference"
                component={EditReference}
                label="the entire exam"
              />
            </Form.Group>
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

const ExamEditorForm = reduxForm<FormValues, ExamEditorExtraProps>({
  form: 'version-editor',
})(ExamEditor);
