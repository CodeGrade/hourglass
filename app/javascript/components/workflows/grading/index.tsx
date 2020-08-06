import React, {
  useMemo,
  useState,
  useRef,
  useContext,
} from 'react';
import {
  Form,
  Row,
  Col,
  Button,
  Card,
  Alert,
  AlertProps,
  ButtonProps,
  Collapse,
  Table,
  Container,
} from 'react-bootstrap';
import {
  FaChevronCircleLeft,
  FaChevronCircleRight,
  FaTrash,
  FaChevronUp,
  FaChevronDown,
  FaUndo,
} from 'react-icons/fa';
import { RiMessage2Line, RiChatDeleteLine, RiChatCheckLine } from 'react-icons/ri';
import { FiCheckSquare } from 'react-icons/fi';
import Icon from '@student/exams/show/components/Icon';
import {
  HTMLVal,
  BodyItem,
  AnswerState,
  TextState,
  CodeState,
  CodeTagState,
  MatchingState,
  AllThatApplyState,
  MultipleChoiceState,
  YesNoState,
  ExamFile,
  AnswersState,
  QuestionInfo,
} from '@student/exams/show/types';
import HTML from '@student/exams/show/components/HTML';
import { isNoAns } from '@student/exams/show/containers/questions/connectors';
import { ExamViewerContext, ExamContext } from '@hourglass/common/context';
import { createMap } from '@student/exams/show/files';
import DisplayCode from '@proctor/registrations/show/questions/DisplayCode';
import DisplayCodeTag from '@proctor/registrations/show/questions/DisplayCodeTag';
import GradeYesNo from '@grading/questions/GradeYesNo';
import GradeMatching from '@grading/questions/GradeMatching';
import GradeMultipleChoice from '@grading/questions/GradeMultipleChoice';
import DisplayText from '@proctor/registrations/show/questions/DisplayText';
import { ExhaustiveSwitchError, alphabetIdx } from '@hourglass/common/helpers';
import DisplayAllThatApply from '@proctor/registrations/show/questions/DisplayAllThatApply';
import DisplayMultipleChoice from '@proctor/registrations/show/questions/DisplayMultipleChoice';
import convertRubric from '@professor/exams/rubrics';
import {
  useParams,
  Switch,
  Route,
  useHistory,
} from 'react-router-dom';
import {
  useQuery,
  useFragment,
  graphql,
  useMutation,
} from 'relay-hooks';
import { QuestionName } from '@student/exams/show/components/ShowQuestion';
import { PartName } from '@student/exams/show/components/Part';
import DisplayMatching from '@proctor/registrations/show/questions/DisplayMatching';
import DisplayYesNo from '@proctor/registrations/show/questions/DisplayYesNo';
import { RenderError } from '@hourglass/common/boundary';
import { AlertContext } from '@hourglass/common/alerts';
import { IconType } from 'react-icons';
import {
  BsPencilSquare,
  BsXSquare,
} from 'react-icons/bs';
import Tooltip from '@student/exams/show/components/Tooltip';
import TooltipButton from '@student/exams/show/components/TooltipButton';
import FourOhFour from '@hourglass/workflows/FourOhFour';
import Spoiler from '@hourglass/common/Spoiler';
import { assertType, isExamRubric } from '@professor/exams/types';
import { ShowRubrics } from '@grading/UseRubrics';
import { CREATE_COMMENT_MUTATION, addCommentConfig } from '@grading/createComment';

import { grading_one$key, grading_one$data } from './__generated__/grading_one.graphql';
import { gradingRubric$key } from './__generated__/gradingRubric.graphql';
import { createCommentMutation } from './__generated__/createCommentMutation.graphql';
import { gradingDestroyCommentMutation } from './__generated__/gradingDestroyCommentMutation.graphql';
import { gradingUpdateCommentMutation } from './__generated__/gradingUpdateCommentMutation.graphql';
import { gradingNextMutation } from './__generated__/gradingNextMutation.graphql';
import { gradingReleaseLockMutation } from './__generated__/gradingReleaseLockMutation.graphql';
import { gradingLock$key } from './__generated__/gradingLock.graphql';
import { gradingLocks$key } from './__generated__/gradingLocks.graphql';
import { gradingCompletion$key } from './__generated__/gradingCompletion.graphql';
import { gradingVersionAdmin$key } from './__generated__/gradingVersionAdmin.graphql';
import { gradingExamAdmin$key } from './__generated__/gradingExamAdmin.graphql';
import { gradingQuery } from './__generated__/gradingQuery.graphql';
import { gradingAdminQuery } from './__generated__/gradingAdminQuery.graphql';

export function variantForPoints(points: number): AlertProps['variant'] {
  if (points < 0) return 'danger';
  if (points > 0) return 'success';
  return 'warning';
}

export function iconForPoints(points: number): IconType {
  if (points < 0) return RiChatDeleteLine;
  if (points > 0) return RiChatCheckLine;
  return RiMessage2Line;
}

enum CommentSaveStatus {
  SAVED = 'saved',
  DIRTY = 'dirty',
  ERROR = 'error',
}

const ShowStatusIcon: React.FC<{
  status: CommentSaveStatus;
  error?: string;
}> = (props) => {
  const {
    status,
    error,
  } = props;
  let StatusIcon: IconType;
  let variant: ButtonProps['variant'];
  switch (status) {
    case CommentSaveStatus.SAVED:
      StatusIcon = FiCheckSquare;
      variant = 'success';
      break;
    case CommentSaveStatus.DIRTY:
      StatusIcon = BsPencilSquare;
      variant = 'warning';
      break;
    case CommentSaveStatus.ERROR:
      StatusIcon = BsXSquare;
      variant = 'danger';
      break;
    default:
      throw new ExhaustiveSwitchError(status);
  }
  if (error) {
    return (
      <TooltipButton
        disabled
        disabledMessage={error}
        variant={variant}
        size="sm"
      >
        <span>
          <Icon I={StatusIcon} />
        </span>
      </TooltipButton>
    );
  }
  return (
    <Button disabled variant={variant} size="sm">
      <Icon I={StatusIcon} />
    </Button>
  );
};

function isNode(et: EventTarget): et is Node {
  return et instanceof Node;
}

const Feedback: React.FC<{
  disabled?: boolean;
  message: string;
  onChangeMessage?: (comment: string) => void;
  points: number;
  onChangePoints?: (pts: number) => void;
  couldReset?: boolean;
  onReset?: () => void;
  onRemove?: () => void;
  onBlur?: AlertProps['onBlur'];
  status: CommentSaveStatus;
  error?: string;
}> = (props) => {
  const {
    disabled = false,
    points,
    onChangePoints,
    message,
    onChangeMessage,
    couldReset,
    onReset,
    onRemove,
    onBlur,
    status,
    error,
  } = props;
  const alertRef = useRef<HTMLDivElement>();
  const variant = variantForPoints(points);
  return (
    <Alert
      ref={alertRef}
      variant={variant}
      onBlur={(e) => {
        if (isNode(e.relatedTarget) && alertRef.current.contains(e.relatedTarget)) return;
        if (onBlur) onBlur(e);
      }}
    >
      <Row>
        <Form.Group as={Col} lg="auto">
          <Form.Label>Points</Form.Label>
          <Form.Control
            disabled={disabled}
            step={0.5}
            type="number"
            value={points}
            onChange={(e) => {
              if (onChangePoints) onChangePoints(Number(e.target.value));
            }}
          />
        </Form.Group>
        <Form.Group className="ml-auto mr-3">
          <Form.Label>Status</Form.Label>
          <div>
            {couldReset && (
              <Button
                className="mr-2"
                variant="outline-warning"
                size="sm"
                onClick={onReset}
                title="Reset to suggested preset values"
              >
                <Icon I={FaUndo} />
              </Button>
            )}
            <span>
              <ShowStatusIcon error={error} status={status} />
            </span>
            <Button
              disabled={disabled}
              className="ml-2"
              variant="outline-danger"
              size="sm"
              onClick={onRemove}
              title="Delete this comment"
            >
              <Icon I={FaTrash} />
            </Button>
          </div>
        </Form.Group>
      </Row>
      <Row>
        <Form.Group as={Col}>
          <Form.Label>Comment</Form.Label>
          <Form.Control
            as="textarea"
            disabled={disabled}
            value={message}
            onChange={(e) => {
              if (onChangeMessage) onChangeMessage(e.target.value);
            }}
          />
        </Form.Group>
      </Row>
    </Alert>
  );
};

const PromptRow: React.FC<{
  prompt: HTMLVal;
}> = ({ prompt }) => (
  <Row>
    <Col sm={{ span: 6, offset: 3 }}>
      <HTML value={prompt} />
    </Col>
  </Row>
);

const NewComment: React.FC<{
  disabled?: boolean;
  message: string;
  points: number;
  onChange: (points: number, message: string) => void;
  onRemove: () => void;
  onCreate: () => void;
  error?: string;
}> = (props) => {
  const {
    disabled = false,
    message,
    points,
    onChange,
    onRemove,
    onCreate,
    error,
  } = props;
  const status = error ? CommentSaveStatus.ERROR : CommentSaveStatus.DIRTY;
  return (
    <Feedback
      disabled={disabled}
      points={points}
      onChangePoints={(pts) => onChange(pts, message)}
      message={message}
      onChangeMessage={(msg) => onChange(points, msg)}
      onRemove={onRemove}
      onBlur={onCreate}
      status={status}
      error={error}
    />
  );
};

interface CommentVal {
  points: number;
  message: string;
  error?: string;
}

interface NewCommentMap {
  [id: number]: CommentVal;
}

const NewComments: React.FC<{
  registrationId: string;
  qnum: number;
  pnum: number;
  bnum: number;
}> = (props) => {
  const {
    registrationId,
    qnum,
    pnum,
    bnum,
  } = props;
  const lastId = useRef<number>(0);
  const [commentMap, setCommentMap] = useState<NewCommentMap>({});
  const addNew = () => {
    setCommentMap({
      ...commentMap,
      [lastId.current]: {
        points: 0,
        message: '',
      },
    });
    lastId.current += 1;
  };
  const [mutate, { loading }] = useMutation<createCommentMutation>(
    CREATE_COMMENT_MUTATION,
    {
      configs: [addCommentConfig(registrationId)],
    },
  );
  return (
    <>
      {Object.entries(commentMap).map(([id, { message, points, error }]) => {
        const onChange = (pts: number, msg: string) => {
          setCommentMap({
            ...commentMap,
            [id]: {
              message: msg,
              points: pts,
            },
          });
        };
        const onRemove = () => {
          const newMap = { ...commentMap };
          delete newMap[id];
          setCommentMap(newMap);
        };
        const setError = (errMsg: string) => {
          setCommentMap({
            ...commentMap,
            [id]: {
              ...commentMap[id],
              error: errMsg,
            },
          });
        };
        const onCreate = () => {
          mutate({
            variables: {
              input: {
                registrationId,
                qnum,
                pnum,
                bnum,
                message,
                points,
              },
            },
          }).then(() => {
            onRemove();
          }).catch((err) => {
            setError(err.message);
          });
        };
        return (
          <NewComment
            key={id}
            disabled={loading}
            message={message}
            points={points}
            onChange={onChange}
            onRemove={onRemove}
            onCreate={onCreate}
            error={error}
          />
        );
      })}
      <Button
        variant="primary"
        onClick={addNew}
      >
        <Icon className="mr-2" I={RiMessage2Line} />
        Add new comment
      </Button>
    </>
  );
};

type GradingComment = grading_one$data['gradingComments']['edges'][number]['node'];

const DESTROY_COMMENT_MUTATION = graphql`
  mutation gradingDestroyCommentMutation($input: DestroyGradingCommentInput!) {
    destroyGradingComment(input: $input) {
      deletedId
    }
  }
`;

const UPDATE_COMMENT_MUTATION = graphql`
  mutation gradingUpdateCommentMutation($input: UpdateGradingCommentInput!) {
    updateGradingComment(input: $input) {
      gradingComment {
        id
        points
        message
        presetComment {
          id
          graderHint
          studentFeedback
          points
        }
      }
    }
  }
`;

const SavedComment: React.FC<{
  registrationId: string;
  comment: GradingComment;
}> = (props) => {
  const {
    registrationId,
    comment,
  } = props;
  const {
    message,
    points,
    presetComment,
  } = comment;
  const { alert } = useContext(AlertContext);
  const [error, setError] = useState<string>(null);
  const [value, setValue] = useState<CommentVal>({
    message,
    points,
  });
  const [status, setStatus] = useState<CommentSaveStatus>(CommentSaveStatus.SAVED);
  const onChangeMessage = (newMsg: string) => {
    setStatus(CommentSaveStatus.DIRTY);
    setValue((old) => ({
      ...old,
      message: newMsg,
    }));
  };
  const onChangePoints = (newPoints: number) => {
    setStatus(CommentSaveStatus.DIRTY);
    setValue((old) => ({
      ...old,
      points: newPoints,
    }));
  };
  const onReset = () => {
    setStatus(CommentSaveStatus.DIRTY);
    setValue((old) => ({
      ...old,
      message: presetComment.studentFeedback ?? presetComment.graderHint,
      points: presetComment.points,
    }));
  };
  const couldReset = (presetComment instanceof Object)
    && ((value.message !== presetComment.studentFeedback
           && value.message !== presetComment.graderHint)
        || value.points !== presetComment.points);
  const [mutateUpdate, { loading: updateLoading }] = useMutation<gradingUpdateCommentMutation>(
    UPDATE_COMMENT_MUTATION,
    {
      onCompleted: () => {
        setStatus(CommentSaveStatus.SAVED);
      },
      onError: (err) => {
        setStatus(CommentSaveStatus.ERROR);
        setError(err.message);
      },
    },
  );
  const [mutateDestroy, { loading: destroyLoading }] = useMutation<gradingDestroyCommentMutation>(
    DESTROY_COMMENT_MUTATION,
    {
      configs: [{
        type: 'RANGE_DELETE',
        parentID: registrationId,
        connectionKeys: [{
          key: 'Registration_gradingComments',
        }],
        pathToConnection: ['registration', 'gradingComments'],
        deletedIDFieldName: 'deletedId',
      }],
      onCompleted: () => {
        alert({
          variant: 'success',
          message: 'Comment successfully deleted.',
          autohide: true,
        });
      },
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error deleting comment',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const removeComment = () => {
    mutateDestroy({
      variables: {
        input: {
          gradingCommentId: comment.id,
        },
      },
    });
  };
  const doUpdate = () => {
    mutateUpdate({
      variables: {
        input: {
          gradingCommentId: comment.id,
          message: value.message,
          points: value.points,
        },
      },
    });
  };
  return (
    <Feedback
      disabled={destroyLoading || updateLoading}
      points={value.points}
      onChangePoints={onChangePoints}
      message={value.message}
      onChangeMessage={onChangeMessage}
      couldReset={couldReset}
      onReset={onReset}
      status={status}
      onRemove={removeComment}
      onBlur={doUpdate}
      error={error}
    />
  );
};

const SavedComments: React.FC<{
  comments: GradingComment[];
  registrationId: string;
}> = (props) => {
  const {
    comments,
    registrationId,
  } = props;
  return (
    <>
      {comments.map((comment) => (
        <SavedComment
          key={comment.id}
          comment={comment}
          registrationId={registrationId}
        />
      ))}
    </>
  );
};

const BodyItemGrades: React.FC<{
  registrationId: string;
  qnum: number;
  pnum: number;
  bnum: number;
  comments: GradingComment[];
}> = (props) => {
  const {
    registrationId,
    qnum,
    pnum,
    bnum,
    comments,
  } = props;
  return (
    <>
      <SavedComments
        registrationId={registrationId}
        comments={comments}
      />
      <NewComments
        registrationId={registrationId}
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
      />
    </>
  );
};

interface AnswersRowProps<T, V> {
  ShowStudent?: React.ComponentType<{
    info: T,
    value: V,
  }>;
  ShowExpected: React.ComponentType<{
    info: T,
    value: V,
  }>;
  info: T;
  studentAnswer: V;
  expectedAnswer: V;
  examVersionKey: gradingRubric$key;
  qnum: number;
  pnum: number;
  bnum: number;
  comments: GradingComment[];
  registrationId: string;
}

function AnswersRow<T, V>(
  props: React.PropsWithChildren<AnswersRowProps<T, V>>,
): React.ReactElement<AnswersRowProps<T, V>> {
  const {
    ShowExpected,
    ShowStudent = ShowExpected,
    info,
    studentAnswer,
    expectedAnswer,
    examVersionKey,
    qnum,
    pnum,
    bnum,
    comments,
    registrationId,
    children,
  } = props;
  const res = useFragment<gradingRubric$key>(
    graphql`
    fragment gradingRubric on ExamVersion {
      id
      rubrics {
        id
        railsId
        type
        parentSectionId
        qnum
        pnum
        bnum
        order
        points
        description { 
          type
          value
        }
        rubricPreset {
          id
          railsId
          direction
          label
          mercy
          presetComments {
            id
            railsId
            label
            order
            points
            graderHint
            studentFeedback
          }
        }
        subsections {
          id
        }
      }
    }
    `,
    examVersionKey,
  );
  const rubrics = assertType(isExamRubric, convertRubric(res.rubrics));
  const { examRubric } = rubrics;
  const qnumRubric = rubrics.questions[qnum]?.questionRubric;
  const pnumRubric = rubrics.questions[qnum]?.parts[pnum]?.partRubric;
  const bnumRubric = rubrics.questions[qnum]?.parts[pnum]?.body[bnum];
  return (
    <Card>
      <Card.Body>
        <Row>
          <Col md={6}><b>Student</b></Col>
          <Col md={6}><b>Rubric</b></Col>
        </Row>
        <hr />
        <Row>
          <Col md={6}>
            <ShowStudent
              info={info}
              value={studentAnswer}
            >
              {children}
            </ShowStudent>
          </Col>
          <Col md={6}>
            <ShowExpected
              info={info}
              value={expectedAnswer}
            />
          </Col>
        </Row>
        <hr />
        <Row>
          <Col>
            <BodyItemGrades
              registrationId={registrationId}
              qnum={qnum}
              pnum={pnum}
              bnum={bnum}
              comments={comments}
            />
          </Col>
          <Col md={6}>
            <ShowRubrics
              examRubric={examRubric}
              qnumRubric={qnumRubric}
              pnumRubric={pnumRubric}
              bnumRubric={bnumRubric}
              showCompletenessAgainst={comments.map((c) => c.presetComment?.id)}
              registrationId={registrationId}
              qnum={qnum}
              pnum={pnum}
              bnum={bnum}
            />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

const GradeBodyItem: React.FC<{
  expectedAnswer: AnswerState;
  studentAnswer: AnswerState;
  info: BodyItem;
  qnum: number;
  pnum: number;
  bnum: number;
  examVersionKey: gradingRubric$key;
  check?: grading_one$data['gradingChecks'][number];
  comments: GradingComment[];
  registrationId: string;
}> = (props) => {
  const {
    expectedAnswer,
    studentAnswer,
    info,
    examVersionKey,
    qnum,
    pnum,
    bnum,
    comments,
    registrationId,
  } = props;
  switch (info.type) {
    case 'HTML':
      return (
        <PromptRow prompt={info} />
      );
    case 'Code':
      return (
        <>
          <PromptRow prompt={info.prompt} />
          <AnswersRow
            examVersionKey={examVersionKey}
            qnum={qnum}
            pnum={pnum}
            bnum={bnum}
            info={info}
            ShowExpected={DisplayCode}
            studentAnswer={studentAnswer as CodeState}
            expectedAnswer={expectedAnswer as CodeState}
            comments={comments}
            registrationId={registrationId}
          />
        </>
      );
    case 'CodeTag':
      return (
        <>
          <PromptRow prompt={info.prompt} />
          <AnswersRow
            examVersionKey={examVersionKey}
            qnum={qnum}
            pnum={pnum}
            bnum={bnum}
            info={info}
            ShowExpected={DisplayCodeTag}
            studentAnswer={studentAnswer as CodeTagState}
            expectedAnswer={expectedAnswer as CodeTagState}
            comments={comments}
            registrationId={registrationId}
          />
        </>
      );
    case 'YesNo':
      return (
        <>
          <PromptRow prompt={info.prompt} />
          <AnswersRow
            examVersionKey={examVersionKey}
            qnum={qnum}
            pnum={pnum}
            bnum={bnum}
            info={info}
            ShowStudent={GradeYesNo}
            ShowExpected={DisplayYesNo}
            studentAnswer={studentAnswer as YesNoState}
            expectedAnswer={expectedAnswer as YesNoState}
            comments={comments}
            registrationId={registrationId}
          />
        </>
      );
    case 'Text':
      return (
        <>
          <PromptRow prompt={info.prompt} />
          <AnswersRow
            examVersionKey={examVersionKey}
            qnum={qnum}
            pnum={pnum}
            bnum={bnum}
            info={info}
            ShowExpected={DisplayText}
            studentAnswer={studentAnswer as TextState}
            expectedAnswer={expectedAnswer as TextState}
            comments={comments}
            registrationId={registrationId}
          />
        </>
      );
    case 'Matching':
      return (
        <>
          {/* <PromptRow prompt={info.prompt} /> */}
          <AnswersRow
            examVersionKey={examVersionKey}
            qnum={qnum}
            pnum={pnum}
            bnum={bnum}
            info={info}
            ShowStudent={GradeMatching}
            ShowExpected={DisplayMatching}
            studentAnswer={studentAnswer as MatchingState}
            expectedAnswer={expectedAnswer as MatchingState}
            comments={comments}
            registrationId={registrationId}
          />
        </>
      );
    case 'AllThatApply':
      return (
        <>
          <PromptRow prompt={info.prompt} />
          <AnswersRow
            examVersionKey={examVersionKey}
            qnum={qnum}
            pnum={pnum}
            bnum={bnum}
            info={info}
            ShowExpected={DisplayAllThatApply}
            studentAnswer={studentAnswer as AllThatApplyState}
            expectedAnswer={expectedAnswer as AllThatApplyState}
            comments={comments}
            registrationId={registrationId}
          />
        </>
      );
    case 'MultipleChoice':
      return (
        <>
          <PromptRow prompt={info.prompt} />
          <AnswersRow
            examVersionKey={examVersionKey}
            qnum={qnum}
            pnum={pnum}
            bnum={bnum}
            info={info}
            ShowStudent={GradeMultipleChoice}
            ShowExpected={DisplayMultipleChoice}
            studentAnswer={studentAnswer as MultipleChoiceState}
            expectedAnswer={expectedAnswer as MultipleChoiceState}
            comments={comments}
            registrationId={registrationId}
          />
        </>
      );
    default:
      throw new ExhaustiveSwitchError(info);
  }
};

const RELEASE_LOCK_MUTATION = graphql`
mutation gradingReleaseLockMutation($input: ReleaseGradingLockInput!) {
  releaseGradingLock(input: $input) {
    released
    gradingLock {
      id
      grader {
        displayName
      }
    }
  }
}
`;

const GRADE_NEXT_MUTATION = graphql`
mutation gradingNextMutation($input: GradeNextInput!) {
  gradeNext(input: $input) {
    registrationId
    qnum
    pnum
  }
}
`;

const Grade: React.FC<{
  registrationKey: grading_one$key;
  qnum: number;
  pnum: number;
}> = (props) => {
  const {
    registrationKey,
    qnum,
    pnum,
  } = props;
  const res = useFragment(
    graphql`
    fragment grading_one on Registration {
      id
      currentAnswers
      gradingComments(
        first: 100000
      ) @connection(key: "Registration_gradingComments", filters: []) {
        edges {
          node {
            id
            qnum
            pnum
            bnum
            points
            message
            presetComment {
              id
              points
              graderHint
              studentFeedback
            }
          }
        }
      }
      gradingChecks {
        id
        qnum
        pnum
        bnum
        points
      }
      examVersion {
        ...gradingRubric
        questions
        answers
        files
      }
    }
    `,
    registrationKey,
  );
  const { alert } = useContext(AlertContext);
  const history = useHistory();
  const { examId, registrationId } = useParams();
  const { examVersion } = res;
  const currentAnswers = res.currentAnswers as AnswersState;
  const { answers } = examVersion;
  const questions = examVersion.questions as QuestionInfo[];
  const files = examVersion.files as ExamFile[];
  const contextVal = useMemo(() => ({
    files,
    fmap: createMap(files),
  }), [files]);
  const viewerContextVal = useMemo(() => ({
    answers: currentAnswers,
  }), [currentAnswers]);
  const [mutateNext, { loading: nextLoading }] = useMutation<gradingNextMutation>(
    GRADE_NEXT_MUTATION,
    {
      onCompleted: ({ gradeNext }) => {
        const {
          registrationId: nextRegId,
          qnum: nextQ,
          pnum: nextP,
        } = gradeNext;
        history.replace(`/exams/${examId}/grading/${nextRegId}/${nextQ}/${nextP}`);
      },
      onError: () => {
        history.replace(`/exams/${examId}/grading`);
      },
    },
  );
  const [mutateRelease, { loading: releaseLoading }] = useMutation<gradingReleaseLockMutation>(
    RELEASE_LOCK_MUTATION,
    {
      onCompleted: () => {
        mutateNext({
          variables: {
            input: {
              examId,
            },
          },
        });
      },
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error completing grading',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const nextExamLoading = releaseLoading || nextLoading;
  return (
    <ExamContext.Provider value={contextVal}>
      <ExamViewerContext.Provider value={viewerContextVal}>
        <div>
          <Row>
            <Col sm={{ span: 6, offset: 3 }}>
              <h2><QuestionName qnum={qnum} name={questions[qnum].name} /></h2>
            </Col>
          </Row>
          <div>
            <Row>
              <Col sm={{ span: 6, offset: 3 }}>
                <h3><PartName pnum={pnum} name={questions[qnum].parts[pnum].name} /></h3>
              </Col>
            </Row>
            {questions[qnum].parts[pnum].body.map((b, bnum) => {
              const studentAns = currentAnswers.answers[qnum][pnum][bnum];
              const studentAnswer = isNoAns(studentAns) ? undefined : studentAns;

              const ans = answers[qnum][pnum][bnum];
              const expectedAnswer = isNoAns(ans) ? undefined : ans;
              const check = res.gradingChecks.find((c) => (
                c.qnum === qnum
                && c.pnum === pnum
                && c.bnum === bnum
              ));
              const comments = res.gradingComments.edges
                .map(({ node }) => node)
                .filter((comment) => (
                  comment.qnum === qnum
                  && comment.pnum === pnum
                  && comment.bnum === bnum
                ));
              return (
                <GradeBodyItem
                  // eslint-disable-next-line react/no-array-index-key
                  key={bnum}
                  info={b}
                  studentAnswer={studentAnswer}
                  expectedAnswer={expectedAnswer}
                  qnum={qnum}
                  pnum={pnum}
                  bnum={bnum}
                  examVersionKey={res.examVersion}
                  check={check}
                  comments={comments}
                  registrationId={res.id}
                />
              );
            })}
          </div>
        </div>
        <Row>
          <Button
            disabled={nextExamLoading}
            onClick={() => {
              mutateRelease({
                variables: {
                  input: {
                    markComplete: true,
                    registrationId,
                    qnum,
                    pnum,
                  },
                },
              });
            }}
          >
            Finish this submission and start next one
          </Button>
        </Row>
      </ExamViewerContext.Provider>
    </ExamContext.Provider>
  );
};

const GradeOnePart: React.FC = () => {
  const { registrationId, qnum, pnum } = useParams();
  const res = useQuery<gradingQuery>(
    graphql`
    query gradingQuery($registrationId: ID!) {
      registration(id: $registrationId) {
        ...grading_one
        exam {
          name
        }
        examVersion {
          answers
        }
      }
    }
    `,
    { registrationId },
  );
  if (res.error) {
    return <Container><RenderError error={res.error} /></Container>;
  }
  if (!res.props) {
    return <Container><p>Loading...</p></Container>;
  }

  return (
    <Container fluid>
      <Row>
        <Col sm="auto">
          <Icon I={FaChevronCircleLeft} size="3em" />
        </Col>
        <Col className="overflow-auto-y">
          <Row>
            <Col sm={{ span: 6, offset: 3 }}>
              <h1>{res.props.registration.exam.name}</h1>
            </Col>
          </Row>
          <Grade
            registrationKey={res.props.registration}
            qnum={Number(qnum)}
            pnum={Number(pnum)}
          />
        </Col>
        <Col sm="auto">
          <Icon I={FaChevronCircleRight} size="3em" />
        </Col>
      </Row>
    </Container>
  );
};

const BeginGradingButton: React.FC = () => {
  const { examId } = useParams();
  const history = useHistory();
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<gradingNextMutation>(
    GRADE_NEXT_MUTATION,
    {
      onCompleted: ({ gradeNext }) => {
        const {
          registrationId,
          qnum,
          pnum,
        } = gradeNext;
        history.push(`/exams/${examId}/grading/${registrationId}/${qnum}/${pnum}`);
      },
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error getting started',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  return (
    <Button
      disabled={loading}
      variant="primary"
      onClick={() => {
        mutate({
          variables: {
            input: {
              examId,
            },
          },
        });
      }}
    >
      Begin grading
    </Button>
  );
};

const GradingGrader: React.FC = () => (
  <Container>
    <BeginGradingButton />
  </Container>
);

const GradingLock: React.FC<{
  lockKey: gradingLock$key;
}> = (props) => {
  const {
    lockKey,
  } = props;
  const lock = useFragment(
    graphql`
    fragment gradingLock on GradingLock {
      qnum
      pnum
      registration {
        id
        user {
          displayName
        }
      }
      grader {
        displayName
      }
    }
    `,
    lockKey,
  );
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<gradingReleaseLockMutation>(
    RELEASE_LOCK_MUTATION,
    {
      onCompleted: () => {
        alert({
          variant: 'success',
          message: 'Lock released',
          autohide: true,
        });
      },
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error releasing lock',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  if (!lock.grader) return null;
  return (
    <tr>
      <td><QuestionName qnum={lock.qnum} /></td>
      <td><PartName pnum={lock.pnum} /></td>
      <td>
        <Spoiler text={lock.registration.user.displayName} />
      </td>
      <td>{lock.grader.displayName}</td>
      <td>
        <Button
          disabled={loading}
          variant="danger"
          onClick={() => {
            mutate({
              variables: {
                input: {
                  markComplete: false,
                  registrationId: lock.registration.id,
                  qnum: lock.qnum,
                  pnum: lock.pnum,
                },
              },
            });
          }}
        >
          <Icon I={FaTrash} className="mr-2" />
          Release lock
        </Button>
      </td>
    </tr>
  );
};

const VersionLocks: React.FC<{
  versionKey: gradingLocks$key;
}> = (props) => {
  const { versionKey } = props;
  const version = useFragment(
    graphql`
    fragment gradingLocks on ExamVersion {
      gradingLocks {
        edges {
          node {
            id
            ...gradingLock
          }
        }
      }
    }
    `,
    versionKey,
  );
  return (
    <Table>
      <thead>
        <tr>
          <th>Question</th>
          <th>Part</th>
          <th>Student</th>
          <th>Grader</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {version.gradingLocks.edges.map(({ node }) => (
          <GradingLock key={node.id} lockKey={node} />
        ))}
      </tbody>
    </Table>
  );
};

const GradingCompletion: React.FC<{
  versionKey: gradingCompletion$key;
}> = (props) => {
  const { versionKey } = props;
  const version = useFragment(
    graphql`
    fragment gradingCompletion on ExamVersion {
      gradingLocks {
        edges {
          node {
            qnum
            pnum
            grader { id }
            completedBy { id }
          }
        }
      }
    }
    `,
    versionKey,
  );
  const completionStats: {
    notStarted: number;
    inProgress: number;
    finished: number;
  }[][] = [];
  const { gradingLocks } = version;
  gradingLocks.edges.forEach(({ node }) => {
    const {
      qnum,
      pnum,
      grader,
      completedBy,
    } = node;
    if (completionStats[qnum] === undefined) completionStats[qnum] = [];
    if (completionStats[qnum][pnum] === undefined) {
      completionStats[qnum][pnum] = {
        notStarted: 0,
        inProgress: 0,
        finished: 0,
      };
    }
    const qpStat = completionStats[qnum][pnum];
    if (completedBy !== null) qpStat.finished += 1;
    else if (grader !== null && completedBy === null) qpStat.inProgress += 1;
    else qpStat.notStarted += 1;
  });
  return (
    <Table>
      <thead>
        <tr>
          {completionStats.map((qStat, qnum) => (
            <th
              // eslint-disable-next-line react/no-array-index-key
              key={`q${qnum}`}
              className="border-bottom-0 pb-0"
              colSpan={qStat.length}
            >
              {`Question ${qnum + 1}`}
            </th>
          ))}
        </tr>
        <tr>
          {completionStats.map((qStats, qnum) => (
            qStats.map((_pStats, pnum) => (
              <th
                // eslint-disable-next-line react/no-array-index-key
                key={`q${qnum}-p${pnum}`}
                className="border-top-0 pt-0"
              >
                {`Part ${alphabetIdx(pnum)}`}
              </th>
            ))
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {completionStats.map((qStats, qnum) => (
            qStats.map((pStat, pnum) => {
              const { notStarted, inProgress, finished } = pStat;
              return (
                // eslint-disable-next-line react/no-array-index-key
                <td key={`q${qnum}-p${pnum}`}>
                  <Tooltip message="Not started / In progress / Finished">
                    <span>{`${notStarted} / ${inProgress} / ${finished}`}</span>
                  </Tooltip>
                </td>
              );
            })
          ))}
        </tr>
      </tbody>
    </Table>
  );
};

const VersionAdministration: React.FC<{
  versionKey: gradingVersionAdmin$key;
}> = (props) => {
  const {
    versionKey,
  } = props;
  const version = useFragment(
    graphql`
    fragment gradingVersionAdmin on ExamVersion {
      id
      name
      startedCount
      finalizedCount
      ...gradingLocks
      ...gradingCompletion
    }
    `,
    versionKey,
  );
  const [open, setOpen] = useState(false);
  return (
    <div className="border p-2 my-4">
      <h3>
        <span
          role="button"
          onClick={(): void => setOpen((o) => !o)}
          onKeyPress={(): void => setOpen((o) => !o)}
          tabIndex={0}
        >
          {version.name}
          {open ? <Icon I={FaChevronUp} /> : <Icon I={FaChevronDown} />}
        </span>
      </h3>
      <Collapse in={open}>
        <div>
          <h4>
            Completion stats
            <small className="ml-4">
              {`${version.startedCount} started; ${version.finalizedCount} finalized`}
            </small>
          </h4>
          <GradingCompletion versionKey={version} />
          <h4>Active grading</h4>
          <VersionLocks versionKey={version} />
        </div>
      </Collapse>
    </div>
  );
};

const ExamGradingAdministration: React.FC<{
  examKey: gradingExamAdmin$key;
}> = (props) => {
  const {
    examKey,
  } = props;
  const res = useFragment(
    graphql`
    fragment gradingExamAdmin on Exam {
      examVersions {
        edges {
          node {
            id
            ...gradingVersionAdmin
          }
        }
      }
    }
    `,
    examKey,
  );
  return (
    <>
      {res.examVersions.edges.map(({ node }) => (
        <VersionAdministration key={node.id} versionKey={node} />
      ))}
    </>
  );
};

const GradingAdmin: React.FC = () => {
  const { examId } = useParams();
  const res = useQuery<gradingAdminQuery>(
    graphql`
    query gradingAdminQuery($examId: ID!) {
      exam(id: $examId) {
        ...gradingExamAdmin
      }
    }
    `,
    { examId },
  );
  if (res.error) {
    return <Container><RenderError error={res.error} /></Container>;
  }
  if (!res.props) {
    return <Container><p>Loading...</p></Container>;
  }
  return (
    <Container>
      <ExamGradingAdministration examKey={res.props.exam} />
      <BeginGradingButton />
    </Container>
  );
};

const Grading: React.FC = () => (
  <Switch>
    <Route exact path="/exams/:examId/grading">
      <GradingGrader />
    </Route>
    <Route exact path="/exams/:examId/grading/admin">
      <GradingAdmin />
    </Route>
    <Route path="/exams/:examId/grading/:registrationId/:qnum/:pnum">
      <GradeOnePart />
    </Route>
    <Route>
      <FourOhFour />
    </Route>
  </Switch>
);

export default Grading;
