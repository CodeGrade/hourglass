import React, { useContext, useEffect, useMemo } from 'react';
import { createMap } from '@student/exams/show/files';
import { ExamContext, ExamFilesContext } from '@hourglass/common/context';
import {
  Button,
  Alert,
  Form,
  Row,
} from 'react-bootstrap';
import {
  ExamVersion,
  AnswersState,
  Policy,
  ExamFile,
  FileRef,
  QuestionInfo,
  PartInfo,
  BodyItem,
  AllThatApplyState,
  AllThatApplyInfo,
  AnswerState,
  MatchingInfo,
  MatchingState,
} from '@student/exams/show/types';
import {
  BodyItemWithAnswer,
  ExamVersionWithAnswers,
  QuestionInfoWithAnswers,
  PartInfoWithAnswers,
  AllThatApplyInfoWithAnswer,
  MatchingInfoWithAnswer,
  Rubric,
  ExamRubric,
} from '@professor/exams/types';
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
import RubricEditor from '@professor/exams/new/editor/RubricEditor';
import { isNoAns } from '@student/exams/show/containers/questions/connectors';
import { useMutation, graphql } from 'relay-hooks';

export interface Version {
  name: string;
  info: {
    policies: readonly Policy[];
    answers: AnswersState['answers'];
    contents: {
      instructions: ExamVersion['instructions'];
      questions: ExamVersion['questions'];
      reference: ExamVersion['reference'];
    };
    rubrics: ExamRubric;
  };
  files: ExamVersion['files'];
}

function transformATAReverse(
  ata: AllThatApplyInfo,
  answer: AllThatApplyState,
  rubric: Rubric,
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
    rubric,
    options: newOptions,
  };
}

function transformMatchingReverse(
  matching: MatchingInfo,
  answer: MatchingState,
  rubric: Rubric,
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
    rubric,
    prompts: newPrompts,
  };
}

function examWithAnswersAndRubrics(
  exam: ExamVersion,
  answers: AnswersState['answers'],
  rubric: ExamRubric,
): ExamVersionWithAnswers {
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
    const qRubric = rubric?.questions[qnum];
    const newParts: PartInfoWithAnswers[] = [];
    parts.forEach((p, pnum) => {
      const {
        body,
        ...restOfP
      } = p;
      const pRubric = qRubric?.parts[pnum];
      const newBody: BodyItemWithAnswer[] = [];
      body.forEach((b, bnum) => {
        const bRubric = pRubric?.body[bnum];
        const ans = answers[qnum][pnum][bnum];
        let newItem: BodyItemWithAnswer;
        switch (b.type) {
          case 'AllThatApply': {
            newItem = transformATAReverse(b, ans as AllThatApplyState, bRubric);
            break;
          }
          case 'Matching': {
            newItem = transformMatchingReverse(b, ans as MatchingState, bRubric);
            break;
          }
          default:
            newItem = {
              ...b,
              rubric: bRubric,
              answer: isNoAns(ans) ? undefined : ans,
            } as BodyItemWithAnswer;
        }
        newBody.push(newItem);
      });
      newParts.push({
        ...restOfP,
        partRubric: pRubric?.partRubric,
        body: newBody,
      });
    });
    newQuestions.push({
      ...restOfQ,
      parts: newParts,
      questionRubric: qRubric?.questionRubric,
    });
  });
  return {
    ...restOfE,
    examRubric: rubric.examRubric,
    questions: newQuestions,
  };
}

export interface ExamEditorProps {
  examVersionId: string;
  exam: ExamVersion;
  versionName: string;
  versionPolicies: readonly Policy[];
  answers: AnswersState;
  rubrics: ExamRubric;
}

const Editor: React.FC<ExamEditorProps> = (props) => {
  const {
    examVersionId,
    exam,
    versionName,
    versionPolicies,
    answers,
    rubrics,
  } = props;
  const initialValues = useMemo(() => ({
    all: {
      name: versionName,
      policies: versionPolicies,
      exam: examWithAnswersAndRubrics(exam, answers.answers, rubrics),
    },
  }), [versionName, versionPolicies, answers.answers, exam, rubrics]);
  return (
    <Provider store={store}>
      <ExamEditorForm
        examVersionId={examVersionId}
        initialValues={initialValues}
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
      // eslint-disable-next-line react/jsx-props-no-spreading
      <Wrappee {...props} value={input.value} onChange={input.onChange} />
    );
  };
}

const WrappedName = wrapInput(Name);
const WrappedPolicies = wrapInput(Policies);
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
  const examContextVal = useMemo(() => ({
    files,
    fmap: createMap(files),
  }), [files]);
  const examFilesContextVal = useMemo(() => ({
    references: examRef,
  }), [examRef]);
  return (
    <ExamContext.Provider value={examContextVal}>
      <ExamFilesContext.Provider value={examFilesContextVal}>
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
  info: AllThatApplyInfo;
  answer: AllThatApplyState;
} {
  const {
    options,
    rubric,
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
  info: MatchingInfo;
  answer: MatchingState;
} {
  const {
    prompts,
    rubric,
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
  const rubrics: ExamRubric = { examRubric: all.exam.examRubric, questions: [] };
  all.exam.questions.forEach((q, qnum) => {
    answers[qnum] = [];
    const {
      parts,
      questionRubric,
      ...restOfQ
    } = q;
    rubrics.questions[qnum] = { questionRubric, parts: [] };
    const newParts: PartInfo[] = [];
    parts.forEach((p, pnum) => {
      answers[qnum][pnum] = [];
      const {
        body,
        partRubric,
        ...restOfP
      } = p;
      rubrics.questions[qnum].parts[pnum] = { partRubric, body: [] };
      const newBody: BodyItem[] = [];
      body.forEach((b, bnum) => {
        let itemAnswer: AnswerState;
        let bodyItem: BodyItem;
        rubrics.questions[qnum].parts[pnum].body[bnum] = b.rubric;
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
              rubric,
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
      rubrics,
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
  const { examId } = useParams();
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
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Exam version not updated.',
          message: <pre>{err.message}</pre>,
          copyButton: true,
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
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error doing autosave',
          message: <pre>{err.message}</pre>,
          autohide: true,
          copyButton: true,
        });
      },
    },
  );
  const loading = saveLoading || autosaveLoading;
  useEffect(() => {
    const timer = setInterval(() => {
      if (undefined !== 1) return; // TODO: remove this
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
              <Field name="files" component={FileUploader} />
              <Field name="instructions" component={WrappedInstructions} />
            </Alert>
            <Form.Group as={Row}>
              <Field
                name="reference"
                component={EditReference}
                label="the entire exam"
              />
            </Form.Group>
            <Field name="examRubric" fieldName="examRubric" component={RubricEditor} />
            <FieldArray name="questions" component={ShowQuestions} />
          </FormContextProviderConnected>
        </FormSection>
        <div className="my-2 float-right">
          <Button
            disabled={loading}
            variant="danger"
            className={pristine ? 'd-none' : 'mr-2'}
            onClick={reset}
          >
            Reset
          </Button>
          <Button
            disabled={loading}
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
