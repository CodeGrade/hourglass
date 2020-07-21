import React, { useContext, useEffect, useMemo } from 'react';
import { createMap } from '@student/exams/show/files';
import { ExamContext, ExamFilesContext } from '@student/exams/show/context';
import {
  Button,
  Alert,
  Form,
  Row,
  Col,
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
  isRubricPresets,
  RubricPresets,
} from '@professor/exams/types';
import {
  reduxForm,
  InjectedFormProps,
  FormSection,
  Field,
  WrappedFieldProps,
  formValueSelector,
  FieldArray,
  WrappedFieldArrayProps,
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
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import { EditHTMLField } from './components/editHTMLs';
import '@professor/exams/rubrics.scss';

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
      <Wrappee value={input.value} onChange={input.onChange} />
    );
  };
}

const RubricPresetEditor: React.FC = () => (
  <Alert variant="warning">
    <Form.Group as={Row}>
      <Form.Label column sm="2">Label</Form.Label>
      <Col sm="4">
        <Field name="label" component="input" type="text" className="w-100" />
      </Col>
      <Form.Label column sm="2">Points</Form.Label>
      <Col sm="4">
        <Field name="points" component="input" type="number" className="w-100" />
      </Col>
    </Form.Group>
    <Form.Group as={Row}>
      <Form.Label column sm="2">Grader hint</Form.Label>
      <Col sm="10">
        <Field
          className="bg-white border rounded"
          name="graderHint"
          component={EditHTMLField}
          theme="bubble"
          placeholder="Give a description to graders to use"
        />
      </Col>
    </Form.Group>
    <Form.Group as={Row}>
      <Form.Label column sm="2">Student feedback</Form.Label>
      <Col sm="10">
        <Field
          className="bg-white border rounded"
          name="studentFeedback"
          component={EditHTMLField}
          theme="bubble"
          placeholder="Give a default message to students -- if blank, will use the grader hint"
        />
      </Col>
    </Form.Group>
  </Alert>
);

const RubricPresetsArrayEditor: React.FC<
  WrappedFieldArrayProps<RubricPresets['presets'][number]>
> = (props) => {
  const { fields } = props;
  return (
    <>
      {fields.map((member, index) => (
        <FormSection
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          name={member}
        >
          <RubricPresetEditor />
        </FormSection>
      ))}
    </>
  );
};


const RubricPresetsEditor: React.FC = () => (
  <FormSection name="choices">
    <Form.Group as={Row}>
      <Form.Label column sm="1">Label</Form.Label>
      <Col sm="3">
        <Field name="label" component="input" type="text" className="w-100" />
      </Col>
      <Form.Label column sm="2">Direction</Form.Label>
      <Col sm="3">
        <Field name="direction" component="input" type="text" className="w-100" />
      </Col>
      <Form.Label column sm="1">Points</Form.Label>
      <Col sm="2">
        <Field name="points" component="input" type="number" className="w-100" />
      </Col>
    </Form.Group>
    {/* Mercy:
    <i>{mercy}</i> */}
    <Form.Label>Presets</Form.Label>
    <FieldArray name="presets" component={RubricPresetsArrayEditor} />
  </FormSection>
);

const WrappedRubricPresetsEditor = wrapInput(RubricPresetsEditor);

const RubricEntriesEditor: React.FC<{
  value: Rubric[] | RubricPresets,
}> = (props) => {
  const { value } = props;
  if (isRubricPresets(value)) {
    return <Field name="choices" component={WrappedRubricPresetsEditor} />;
  }
  // eslint-disable-next-line no-use-before-define
  return <FieldArray name="choices" component={RubricsArrayEditor} />
};

const WrappedRubricEntriesEditor = wrapInput(RubricEntriesEditor);

const RubricAllAnyOneEditor: React.FC<WrappedFieldProps & {
  prompt: string
}> = (props) => {
  const { prompt } = props;
  return (
    <Alert variant="dark">
      <Alert.Heading>
        Rubric: Choose something from
        <i className="mx-1">{prompt}</i>
        entries
      </Alert.Heading>
      <Field
        className="bg-white border rounded"
        name="description"
        component={EditHTMLField}
        theme="bubble"
        placeholder="Give rubric instructions here"
      />
      <Field name="choices" component={WrappedRubricEntriesEditor} />
    </Alert>
  );
};

export const RubricEditor: React.FC<WrappedFieldProps> = (props) => {
  const { input, meta } = props;
  const { value } = input;
  if (value === undefined) {
    return <p>TODO: no rubric here yet</p>;
  }
  const type = value as Rubric['type'];
  let prompt = '';
  switch (type) {
    case 'all': prompt = 'all'; break;
    case 'any': prompt = 'any'; break;
    case 'one': prompt = 'exactly one of the'; break;
    default:
      throw new ExhaustiveSwitchError(type);
  }
  return (
    <div className="rubric">
      <RubricAllAnyOneEditor prompt={prompt} input={input} meta={meta} />
    </div>
  );
};

const RubricsArrayEditor: React.FC<WrappedFieldArrayProps<Rubric>> = (props) => {
  const { fields } = props;
  return (
    <>
      {fields.map((member, index) => (
        <FormSection
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          name={member}
        >
          <Field name="type" component={RubricEditor} />
        </FormSection>
      ))}
    </>
  );
};

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
        if ('rubric' in b) {
          rubrics.questions[qnum].parts[pnum].body[bnum] = b.rubric;
        }
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
        });
      },
    },
  );
  const loading = saveLoading || autosaveLoading;
  /* useEffect(() => {
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
  }, [handleSubmit]); */
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
            <FormSection name="examRubric">
              <Field name="type" component={RubricEditor} />
            </FormSection>
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
