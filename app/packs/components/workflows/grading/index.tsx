import React, {
  useMemo,
  useState,
  useRef,
  useContext,
  useEffect,
  useLayoutEffect,
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
  Dropdown,
  DropdownButton,
  Carousel,
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
import { VscGoToFile } from 'react-icons/vsc';
import Icon from '@student/exams/show/components/Icon';
import {
  HTMLVal,
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
  BodyItemInfo,
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
import {
  ExhaustiveSwitchError,
  alphabetIdx,
  useRefresher,
  pluralize,
} from '@hourglass/common/helpers';
import DisplayAllThatApply from '@proctor/registrations/show/questions/DisplayAllThatApply';
import DisplayMultipleChoice from '@proctor/registrations/show/questions/DisplayMultipleChoice';
import {
  useParams,
  Switch,
  Route,
  useHistory,
  Link,
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
import Part from '@proctor/registrations/show/Part';
import DisplayYesNo from '@proctor/registrations/show/questions/DisplayYesNo';
import { RenderError } from '@hourglass/common/boundary';
import { AlertContext } from '@hourglass/common/alerts';
import { IconType } from 'react-icons';
import { describeTime } from '@student/exams/show/actions';
import { FileViewer } from '@student/exams/show/components/FileViewer';
import {
  BsPencilSquare,
  BsXSquare,
} from 'react-icons/bs';
import Tooltip from '@student/exams/show/components/Tooltip';
import TooltipButton from '@student/exams/show/components/TooltipButton';
import FourOhFour from '@hourglass/workflows/FourOhFour';
import Spoiler from '@hourglass/common/Spoiler';
import { NumericInput } from '@hourglass/common/NumericInput';
import { CurrentGrading } from '@professor/exams/types';
import { ShowRubrics } from '@grading/UseRubrics';
import { CREATE_COMMENT_MUTATION, addCommentConfig } from '@grading/createComment';
import { DateTime } from 'luxon';

import './index.scss';

import { grading_one$key, grading_one$data } from './__generated__/grading_one.graphql';
import { grading_showOne$key } from './__generated__/grading_showOne.graphql';
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
import { gradingBeginGrading$key } from './__generated__/gradingBeginGrading.graphql';
import { gradingMyGrading, gradingMyGrading$key } from './__generated__/gradingMyGrading.graphql';
import { gradingQuery } from './__generated__/gradingQuery.graphql';
import { gradingAdminQuery } from './__generated__/gradingAdminQuery.graphql';
import { gradingGraderQuery } from './__generated__/gradingGraderQuery.graphql';
import { gradingSyncExamToBottlenoseMutation } from './__generated__/gradingSyncExamToBottlenoseMutation.graphql';

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
  const [pointStr, setPointStr] = useState<number | string>(points);
  const [isFocused, setFocused] = useState(true);
  useEffect(() => {
    setPointStr(String(points));
  }, [points]);
  const alertRef = useRef<HTMLDivElement>();
  useLayoutEffect(() => {
    if (isFocused) { alertRef.current.focus(); }
  }, [isFocused]);
  const variant = variantForPoints(points);
  const VariantIcon = iconForPoints(points);
  return (
    <Alert
      ref={alertRef}
      variant={variant}
      tabIndex={-1}
      onBlur={(e) => {
        if (alertRef.current === e.relatedTarget) {
          if (onBlur) onBlur(e);
          return; // don't setFocused and collapse this editor yet.
        }
        if (isNode(e.relatedTarget) && alertRef.current.contains(e.relatedTarget)) return;
        if (onBlur) onBlur(e);
        setFocused(false);
      }}
    >
      {isFocused ? (
        <Row>
          <Form.Group as={Col} sm={2} className="mb-0">
            <Form.Label>Points</Form.Label>
            <NumericInput
              disabled={disabled}
              step={0.5}
              value={pointStr}
              onChange={(val, focused) => {
                setPointStr(val);
                // Don't propagate changes when the value is in an interim state
                // When NumericInput loses focus, it'll send a corrected numeric value.
                if (!focused && onChangePoints && val !== '' && Number.isFinite(Number(val))) {
                  onChangePoints(Number(val));
                }
              }}
            />
          </Form.Group>
          <Form.Group as={Col} className="pl-0 mb-0">
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
          <Form.Group className="ml-auto mr-3 mb-0">
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
      ) : (
        <Row>
          <Form.Group as={Col} sm={2} className="mb-0">
            <Button
              disabled
              variant={variant}
              size="sm"
              className="align-self-center w-100"
            >
              <Icon I={VariantIcon} className="mr-2" />
              {pluralize(points, 'point', 'points')}
            </Button>
          </Form.Group>
          <Form.Group as={Col} className="pl-0 mb-0">{message}</Form.Group>
          <div className="mr-3 mb-0 float-right">
            <span><ShowStatusIcon error={error} status={status} /></span>
            <TooltipButton
              disabled={false}
              variant="outline-info"
              size="sm"
              enabledMessage="Click to edit this comment"
              onClick={() => setFocused(true)}
              className="ml-2"
            >
              <Icon I={BsPencilSquare} />
            </TooltipButton>
          </div>
        </Row>
      )}
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
    setCommentMap((curMap) => ({
      ...curMap,
      [lastId.current]: {
        points: 0,
        message: '',
      },
    }));
    lastId.current += 1;
  };
  const [mutate, { loading }] = useMutation<createCommentMutation>(
    CREATE_COMMENT_MUTATION,
    {
      configs: [addCommentConfig(registrationId)],
    },
  );
  const [needingSaving, setNeedingSaving] = useState<string[]>([]);
  useEffect(() => {
    needingSaving.forEach((id) => {
      const { message, points } = commentMap[id];
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
        setCommentMap((curMap) => {
          const newMap = { ...curMap };
          delete newMap[id];
          return newMap;
        });
      }).catch((err) => {
        setCommentMap((curMap) => ({
          ...curMap,
          [id]: {
            ...curMap[id],
            error: err.message,
          },
        }));
      });
    });
    if (needingSaving.length > 0) { setNeedingSaving([]); }
  }, [needingSaving]);
  return (
    <>
      {Object.entries(commentMap).map(([id, { message, points, error }]) => {
        const onChange = (pts: number, msg: string) => {
          setCommentMap((curMap) => ({
            ...curMap,
            [id]: {
              message: msg,
              points: pts,
            },
          }));
        };
        const onRemove = () => {
          setCommentMap((curMap) => {
            const newMap = { ...curMap };
            delete newMap[id];
            return newMap;
          });
        };
        const onCreate = () => {
          // The last onChange event will fire *after* the onBlur event triggers
          // this onCreate handler, which means that `message` and `points` might
          // be out of data.  So delay the actual saving until the next tick,
          // so that it will reload the values from the current `commentMap`.
          setNeedingSaving([...needingSaving, id]);
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
    refreshProps: React.DependencyList;
    fullyExpandCode?: boolean;
  }>;
  ShowExpected: React.ComponentType<{
    info: T,
    value: V,
    refreshProps: React.DependencyList;
    fullyExpandCode?: boolean;
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
  refreshProps: React.DependencyList;
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
    refreshProps,
  } = props;
  const res = useFragment<gradingRubric$key>(
    graphql`
    fragment gradingRubric on ExamVersion {
      id
      rootRubric { ...UseRubricsKey }
      dbQuestions {
        id
        rootRubric { ...UseRubricsKey }
        parts {
          id
          rootRubric { ...UseRubricsKey }
          bodyItems {
            id
            rootRubric { ...UseRubricsKey }
          }
        }
      }
    }
    `,
    examVersionKey,
  );
  const [studentWidth, setStudentWidth] = useState(6);
  const { rootRubric: examRubricKey } = res;
  const qnumRubricKey = res.dbQuestions[qnum]?.rootRubric;
  const pnumRubricKey = res.dbQuestions[qnum]?.parts[pnum]?.rootRubric;
  const bnumRubricKey = res.dbQuestions[qnum]?.parts[pnum]?.bodyItems[bnum]?.rootRubric;
  return (
    <Card>
      <Card.Body>
        <Row>
          <Col md={studentWidth}><b>Student</b></Col>
          <Col md={12 - studentWidth}><b>Rubric</b></Col>
        </Row>
        <hr />
        <Row>
          <Col md={studentWidth} className="pr-3">
            <ShowStudent
              info={info}
              value={studentAnswer}
              refreshProps={refreshProps}
            >
              {children}
            </ShowStudent>
          </Col>
          <div className="m-0 w-0 p-0 z-1000 d-flex" style={{ maxWidth: '0px' }}>
            <Button
              size="sm"
              variant="secondary"
              className="float-left mx-n2 px-0 h-100"
              onClick={() => setStudentWidth(studentWidth === 6 ? 10 : 6)}
            >
              {'< >'}
            </Button>
          </div>
          <Col md={12 - studentWidth}>
            <ShowExpected
              info={info}
              value={expectedAnswer}
              refreshProps={refreshProps}
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
              examRubricKey={examRubricKey}
              qnumRubricKey={qnumRubricKey}
              pnumRubricKey={pnumRubricKey}
              bnumRubricKey={bnumRubricKey}
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
  info: BodyItemInfo;
  qnum: number;
  pnum: number;
  bnum: number;
  examVersionKey: gradingRubric$key;
  check?: grading_one$data['gradingChecks'][number];
  comments: GradingComment[];
  registrationId: string;
  refreshProps: React.DependencyList;
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
    refreshProps,
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
            refreshProps={refreshProps}
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
            refreshProps={refreshProps}
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
            refreshProps={refreshProps}
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
            refreshProps={refreshProps}
          />
        </>
      );
    case 'Matching':
      return (
        <>
          <PromptRow prompt={info.prompt} />
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
            refreshProps={refreshProps}
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
            refreshProps={refreshProps}
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
            refreshProps={refreshProps}
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

const SYNC_EXAM_TO_BOTTLENOSE_MUTATION = graphql`
mutation gradingSyncExamToBottlenoseMutation($input: SyncExamToBottlenoseInput!) {
  syncExamToBottlenose(input: $input) {
    exam {
      name
    }
  }
}
`;

const Grade: React.FC<{
  registrationKey: grading_one$key;
  qnum: number;
  pnum: number;
  refreshProps: React.DependencyList;
}> = (props) => {
  const {
    registrationKey,
    qnum,
    pnum,
    refreshProps,
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
        id
        ...gradingRubric
        dbQuestions {
          name {
            type
            value
          }
          description {
            type
            value
          }
          extraCredit
          references {
            type
            path
          }
          parts {
            name {
              type
              value
            }
            description {
              type
              value
            }
            references {
              type
              path
            }
            bodyItems {
              info
            }
          }
        }
        answers
        files
      }
    }
    `,
    registrationKey,
  );
  const { alert } = useContext(AlertContext);
  const history = useHistory();
  const { examId, registrationId } = useParams<{ examId: string; registrationId: string }>();
  const { examVersion } = res;
  const currentAnswers = res.currentAnswers as AnswersState;
  const { answers, dbQuestions } = examVersion;
  const files = examVersion.files as ExamFile[];
  const contextVal = useMemo(() => ({
    files,
    fmap: createMap(files),
  }), [files]);
  const viewerContextVal = useMemo(() => ({
    answers: currentAnswers,
  }), [currentAnswers]);
  const [mutateGradeNext, { loading: nextLoading }] = useMutation<gradingNextMutation>(
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
  const [
    mutateReleaseAndContinue,
    { loading: releaseNextLoading },
  ] = useMutation<gradingReleaseLockMutation>(
    RELEASE_LOCK_MUTATION,
    {
      onCompleted: () => {
        mutateGradeNext({
          variables: {
            input: {
              examId,
              examVersionId: examVersion.id,
              qnum,
              pnum,
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
  const [
    mutateReleaseAndFinish,
    { loading: releaseFinishLoading },
  ] = useMutation<gradingReleaseLockMutation>(
    RELEASE_LOCK_MUTATION,
    {
      onCompleted: () => {
        window.location.href = `/exams/${examId}/grading`;
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
  const nextExamLoading = releaseNextLoading || releaseFinishLoading || nextLoading;
  const singlePart = dbQuestions[qnum].parts.length === 1
    && !dbQuestions[qnum].parts[0].name?.value?.trim();
  const allComments = res.gradingComments.edges.map(({ node }) => node);
  const anyUncommentedItems = dbQuestions[qnum].parts[pnum].bodyItems.some((b, bnum) => (
    ((b.info as BodyItemInfo).type !== 'HTML')
      && (allComments.filter((c) => (c.qnum === qnum && c.pnum === pnum && c.bnum === bnum))
        .length === 0)
  ));
  return (
    <ExamContext.Provider value={contextVal}>
      <ExamViewerContext.Provider value={viewerContextVal}>
        <div>
          <Row>
            <Col sm={{ span: 6, offset: 3 }}>
              <h2>
                <QuestionName qnum={qnum} name={dbQuestions[qnum].name} />
                {dbQuestions[qnum].extraCredit ? <span className="ml-4">(Extra credit)</span> : null}
              </h2>
            </Col>
          </Row>
          <PromptRow prompt={dbQuestions[qnum].description} />
          {dbQuestions[qnum].references.length !== 0 && (
            <Row>
              <Col sm={{ span: 9, offset: 3 }}>
                <FileViewer
                  references={dbQuestions[qnum].references}
                  refreshProps={refreshProps}
                />
              </Col>
            </Row>
          )}
          <div>
            <Row>
              <Col sm={{ span: 6, offset: 3 }}>
                <h3>
                  <PartName
                    anonymous={singlePart}
                    pnum={pnum}
                    name={dbQuestions[qnum].parts[pnum].name}
                  />
                </h3>
              </Col>
            </Row>
            <PromptRow prompt={dbQuestions[qnum].parts[pnum].description} />
            {dbQuestions[qnum].parts[pnum].references.length !== 0 && (
              <Row>
                <Col sm={{ span: 9, offset: 3 }}>
                  <FileViewer
                    references={dbQuestions[qnum].parts[pnum].references}
                    refreshProps={refreshProps}
                  />
                </Col>
              </Row>
            )}
            {dbQuestions[qnum].parts[pnum].bodyItems.map((b, bnum) => {
              const studentAns = currentAnswers.answers[qnum][pnum][bnum];
              const studentAnswer = isNoAns(studentAns) ? undefined : studentAns;

              const ans = answers[qnum][pnum][bnum];
              const expectedAnswer = isNoAns(ans) ? undefined : ans;
              const check = res.gradingChecks.find((c) => (
                c.qnum === qnum
                && c.pnum === pnum
                && c.bnum === bnum
              ));
              const comments = allComments.filter((comment) => (
                comment.qnum === qnum && comment.pnum === pnum && comment.bnum === bnum
              ));
              return (
                <GradeBodyItem
                  // eslint-disable-next-line react/no-array-index-key
                  key={bnum}
                  info={b.info as BodyItemInfo}
                  studentAnswer={studentAnswer}
                  expectedAnswer={expectedAnswer}
                  qnum={qnum}
                  pnum={pnum}
                  bnum={bnum}
                  examVersionKey={res.examVersion}
                  check={check}
                  comments={comments}
                  registrationId={res.id}
                  refreshProps={refreshProps}
                />
              );
            })}
          </div>
        </div>
        <Row className="text-center pb-4">
          <Col className="text-center pb-4">
            <span className="m-4">
              <TooltipButton
                variant="primary"
                disabled={nextExamLoading || anyUncommentedItems}
                disabledMessage={nextExamLoading
                  ? 'Please wait; still loading...'
                  : 'Some items have no comments; please grade them'}
                placement="top"
                cursorClass=""
                onClick={() => {
                  mutateReleaseAndContinue({
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
              </TooltipButton>
            </span>
            <DropdownButton
              className="m-4 d-inline-block"
              variant="outline-primary"
              disabled={nextExamLoading}
              title="Exit grading and..."
              drop="right"
            >
              <Tooltip
                showTooltip={nextExamLoading || anyUncommentedItems}
                message={nextExamLoading
                  ? 'Please wait; still loading...'
                  : 'Some items have no comments; please grade them'}
                placement="top"
              >
                <Dropdown.Item
                  className="pointer-events-auto"
                  disabled={anyUncommentedItems}
                  onClick={() => {
                    mutateReleaseAndFinish({
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
                  Finish grading this question
                </Dropdown.Item>
              </Tooltip>
              <Dropdown.Item
                onClick={() => {
                  mutateReleaseAndFinish({
                    variables: {
                      input: {
                        markComplete: false,
                        registrationId,
                        qnum,
                        pnum,
                      },
                    },
                  });
                }}
              >
                Abandon grading this question
              </Dropdown.Item>
            </DropdownButton>
          </Col>
        </Row>
      </ExamViewerContext.Provider>
    </ExamContext.Provider>
  );
};

const ShowOnePart: React.FC<{
  registrationKey: grading_showOne$key;
  qnum: number;
  pnum: number;
  refreshProps: React.DependencyList;
}> = (props) => {
  const {
    registrationKey,
    qnum,
    pnum,
    refreshProps,
  } = props;
  const res = useFragment(
    graphql`
    fragment grading_showOne on Registration {
      id
      currentAnswers
      currentGrading
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
        id
        ...gradingRubric
        dbQuestions {
          name {
            type
            value
          }
          description {
            type
            value
          }
          extraCredit
          references {
            type
            path
          }
          parts {
            id
            name { value }
            ...PartShow
          }
        }
        answers
        files
      }
    }
    `,
    registrationKey,
  );
  const { examVersion } = res;
  const currentAnswers = res.currentAnswers as AnswersState;
  const currentGrading = res.currentGrading as CurrentGrading;
  const questions = examVersion.dbQuestions;
  const files = examVersion.files as ExamFile[];
  const contextVal = useMemo(() => ({
    files,
    fmap: createMap(files),
  }), [files]);
  const viewerContextVal = useMemo(() => ({
    answers: currentAnswers,
  }), [currentAnswers]);
  const singlePart = questions[qnum].parts.length === 1
    && !questions[qnum].parts[0].name?.value?.trim();
  return (
    <ExamContext.Provider value={contextVal}>
      <ExamViewerContext.Provider value={viewerContextVal}>
        <div>
          <Row>
            <Col sm={{ span: 6, offset: 3 }}>
              <h2><QuestionName qnum={qnum} name={questions[qnum].name} /></h2>
            </Col>
          </Row>
          <PromptRow prompt={questions[qnum].description} />
          {questions[qnum].references.length !== 0 && (
            <Row>
              <Col sm={{ span: 9, offset: 3 }}>
                <FileViewer
                  references={questions[qnum].references}
                  refreshProps={refreshProps}
                />
              </Col>
            </Row>
          )}
          <div>
            <Row>
              <Col sm={{ span: 6, offset: 3 }}>
                <Part
                  refreshCodeMirrorsDeps={refreshProps}
                  partKey={questions[qnum].parts[pnum]}
                  qnum={qnum}
                  pnum={pnum}
                  anonymous={singlePart}
                  currentGrading={currentGrading[qnum][pnum]}
                  showRequestGrading={res.id}
                  overviewMode={false}
                />
              </Col>
            </Row>
          </div>
        </div>
      </ExamViewerContext.Provider>
    </ExamContext.Provider>
  );
};

const GradeOnePart: React.FC = () => {
  const { registrationId, qnum, pnum } = useParams<{
    registrationId: string, qnum: string, pnum: string
  }>();
  const res = useQuery<gradingQuery>(
    graphql`
    query gradingQuery($registrationId: ID!, $withRubric: Boolean!) {
      registration(id: $registrationId) {
        ...grading_one
        ...grading_showOne
        exam {
          name
        }
        examVersion {
          qpPairs { qnum pnum }
          answers
        }
      }
    }
    `,
    { registrationId, withRubric: true },
  );

  if (res.error) {
    return <Container><RenderError error={res.error} /></Container>;
  }
  if (!res.data) {
    return <Container><p>Loading...</p></Container>;
  }
  return <GradeOnePartHelp registration={res.data.registration} qnum={qnum} pnum={pnum} />;
};

const GradeOnePartHelp: React.FC<{
  qnum: string,
  pnum: string,
  registration: gradingQuery['response']['registration'],
}> = (props) => {
  const { registration, qnum, pnum } = props;
  const { qpPairs } = registration.examVersion;
  const indexOfQP = qpPairs.findIndex((qp) => (
    qp.qnum === Number(qnum) && qp.pnum === Number(pnum)
  ));
  const [activeIndex, setActiveIndex] = useState(indexOfQP);
  const [refresher, refresh] = useRefresher();
  useEffect(() => {
    setActiveIndex(indexOfQP);
  }, [indexOfQP]);

  return (
    <Container fluid>
      <Row>
        <Col sm={{ span: 6, offset: 3 }}>
          <h1>{registration.exam.name}</h1>
        </Col>
      </Row>
      <Row>
        <Col sm={12}>
          <Carousel
            className="question-carousel"
            activeIndex={activeIndex}
            onSelect={(newIndex, _) => {
              setActiveIndex(newIndex);
            }}
            onSlid={() => refresh()}
            onSlide={() => refresh()}
            indicators={false}
            wrap={false}
            interval={null}
            keyboard={false}
            nextIcon={<Icon I={FaChevronCircleRight} size="3em" />}
            prevIcon={<Icon I={FaChevronCircleLeft} size="3em" />}
          >
            {qpPairs.map((qp, index) => (
              <Carousel.Item
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className="mb-4"
              >
                <Col className="overflow-auto-y">
                  {(index === indexOfQP) ? (
                    <Grade
                      registrationKey={registration}
                      qnum={qp.qnum}
                      pnum={qp.pnum}
                      refreshProps={[indexOfQP, refresher]}
                    />
                  ) : (
                    <ShowOnePart
                      registrationKey={registration}
                      qnum={qp.qnum}
                      pnum={qp.pnum}
                      refreshProps={[indexOfQP, refresher]}
                    />
                  )}
                </Col>
              </Carousel.Item>
            ))}
          </Carousel>
        </Col>
      </Row>
    </Container>
  );
};

const SyncExamToBottlenoseButton: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<gradingSyncExamToBottlenoseMutation>(
    SYNC_EXAM_TO_BOTTLENOSE_MUTATION,
    {
      onCompleted: ({ syncExamToBottlenose }) => {
        alert({
          variant: 'success',
          title: 'Exam synced',
          message: `${syncExamToBottlenose.exam.name} was synced successfully.`,
        });
      },
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error syncing exam',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  return (
    <Button
      disabled={loading}
      variant="success"
      className="mr-2"
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
      Sync to Bottlenose
    </Button>
  );
};

const allBlank = (stats) => {
  if (stats instanceof Array) {
    return stats.every(allBlank);
  }
  return stats.notStarted === 0;
};

type GradingLockInfo = gradingMyGrading['examVersions']['edges'][number]['node']['inProgress']['edges'][number]['node'];
type QPInfo = gradingMyGrading['examVersions']['edges'][number]['node']['qpPairs'];

const groupTree = (
  collection: {readonly edges: readonly {readonly node: GradingLockInfo}[]},
): GradingLockInfo[][][] => {
  const tree : GradingLockInfo[][][] = [];
  collection.edges.forEach(({ node }) => {
    const { qnum, pnum } = node;
    tree[qnum] = tree[qnum] ?? [];
    tree[qnum][pnum] = tree[qnum][pnum] ?? [];
    tree[qnum][pnum].push(node);
  });
  return tree;
};

const RenderQnumTree : React.FC<{
  className?: string,
  info: GradingLockInfo[][][],
  examId: string,
  qpPairs: QPInfo,
  RenderItem: React.FC<{ item: GradingLockInfo, examId: string }>,
}> = (props) => {
  const {
    className,
    info,
    examId,
    qpPairs,
    RenderItem,
  } = props;
  return (
    <ul className={className}>
      {info.map((byQnum, qnum) => {
        if (byQnum === undefined) { return null; }
        if (byQnum.length === 0) { return null; }
        const multipart = qpPairs.some((qp) => (qp.qnum === qnum && qp.pnum > 0));
        if (multipart) {
          return (
            // eslint-disable-next-line react/no-array-index-key
            <li key={qnum}>
              {`Question ${qnum + 1}:`}
              <RenderPnumTree
                info={byQnum}
                multipart={multipart}
                examId={examId}
                RenderItem={RenderItem}
              />
            </li>
          );
        }
        return (
          // eslint-disable-next-line react/no-array-index-key
          <li key={qnum}>
            <CollapsibleQnumTree
              qnum={qnum}
              info={byQnum}
              multipart={multipart}
              examId={examId}
              RenderItem={RenderItem}
            />
          </li>
        );
      })}
    </ul>
  );
};

const CollapsibleQnumTree : React.FC<{
  qnum: number,
  info: GradingLockInfo[][],
  examId: string,
  multipart: boolean,
  RenderItem: React.FC<{ item: GradingLockInfo, examId: string }>,
}> = (props) => {
  const {
    qnum,
    info,
    multipart,
    examId,
    RenderItem,
  } = props;
  const [open, setOpen] = useState(!multipart && info[0]?.length < 10);
  return (
    <>
      <span
        role="button"
        onClick={(): void => setOpen((o) => !o)}
        onKeyPress={(): void => setOpen((o) => !o)}
        tabIndex={0}
      >
        {`Question ${qnum + 1}: `}
        {open ? <Icon I={FaChevronUp} /> : <Icon I={FaChevronDown} />}
      </span>
      <Collapse in={open}>
        <RenderPnumTree
          info={info}
          multipart={multipart}
          examId={examId}
          RenderItem={RenderItem}
        />
      </Collapse>
    </>
  );
};

const RenderPnumTree : React.FC<{
  className?: string,
  info: GradingLockInfo[][],
  examId: string,
  multipart: boolean,
  RenderItem: React.FC<{ item: GradingLockInfo, examId: string }>,
}> = (props) => {
  const {
    className,
    info,
    examId,
    multipart,
    RenderItem,
  } = props;
  if (!multipart) {
    return (
      <ul className={className}>
        {info[0].map((item) => <RenderItem item={item} examId={examId} />)}
      </ul>
    );
  }
  return (
    <ul className={className}>
      {info.map((items, pnum) => (
        // eslint-disable-next-line react/no-array-index-key
        <li key={pnum}>
          <CollapsiblePnumTree
            pnum={pnum}
            items={items}
            examId={examId}
            RenderItem={RenderItem}
          />
        </li>
      ))}
    </ul>
  );
};

const CollapsiblePnumTree : React.FC<{
  pnum: number,
  items: GradingLockInfo[],
  examId: string,
  RenderItem: React.FC<{ item: GradingLockInfo, examId: string }>,
}> = (props) => {
  const {
    pnum,
    items,
    examId,
    RenderItem,
  } = props;
  const [open, setOpen] = useState(items.length < 10);
  return (
    <>
      <span
        role="button"
        onClick={(): void => setOpen((o) => !o)}
        onKeyPress={(): void => setOpen((o) => !o)}
        tabIndex={0}
      >
        {`Part ${alphabetIdx(pnum)}: `}
        {open ? <Icon I={FaChevronUp} /> : <Icon I={FaChevronDown} />}
      </span>
      <Collapse in={open}>
        <ul>
          {items.map((item) => <RenderItem key={item.id} item={item} examId={examId} />)}
        </ul>
      </Collapse>
    </>
  );
};

const RenderLinkToGrading : React.FC<{
  item: GradingLockInfo,
  examId: string,
}> = (props) => {
  const { item, examId } = props;
  const {
    registration,
    updatedAt,
    qnum,
    pnum,
  } = item;
  return (
    <li key={`${registration.id}-${qnum}-${pnum}`}>
      <Tooltip message="Opens submission for grading in new window" placement="top">
        <Link
          className="ml-2"
          target="_blank"
          to={`/exams/${examId}/grading/${registration.id}/${qnum}/${pnum}`}
        >
          {describeTime(DateTime.fromISO(updatedAt))}
        </Link>
      </Tooltip>
    </li>
  );
};

const RenderLinkToSubmission : React.FC<{
  item: GradingLockInfo,
  examId: string,
}> = (props) => {
  const { item, examId } = props;
  const {
    registration,
    updatedAt,
    qnum,
    pnum,
  } = item;
  return (
    <li key={`${registration.id}-${qnum}-${pnum}`}>
      <Spoiler text={registration.user.displayName} />
      <Tooltip message="Opens submission for viewing in new window" placement="top">
        <Link
          className="ml-2"
          target="_blank"
          to={`/exams/${examId}/submissions/${registration.id}`}
        >
          <span className="mr-2">{describeTime(DateTime.fromISO(updatedAt))}</span>
        </Link>
      </Tooltip>
    </li>
  );
};

const MyGrading: React.FC<{
  examKey: gradingMyGrading$key;
}> = (props) => {
  const { examKey } = props;
  const res = useFragment(
    graphql`
    fragment gradingMyGrading on Exam {
      id
      examVersions {
        edges {
          node {
            id
            name
            qpPairs { qnum pnum }
            inProgress: gradingLocks(graderCurrentUser: true) {
              edges {
                node {
                  id
                  qnum
                  pnum
                  updatedAt
                  registration { 
                    id 
                    user { displayName }
                  }
                }
              }
            }
            finished: gradingLocks(completedByCurrentUser:true) {
              edges {
                node {
                  id
                  qnum
                  pnum
                  updatedAt
                  registration { 
                    id
                    user { displayName }
                  }
                }
              }
            }      
          }
        }
      }
    }
    `,
    examKey,
  );
  return (
    <div>
      <h3>My grading so far</h3>
      {res.examVersions.edges.map(({ node }) => {
        const inProgressTree = groupTree(node.inProgress);
        const finishedTree = groupTree(node.finished);
        if (inProgressTree.length === 0 && finishedTree.length === 0) return null;
        return (
          <ul className="d-inline-block align-top">
            {node.inProgress.edges.length > 0 && (
              <li key={`inprogress-${node.id}`}>
                <b>{`${node.name}`}</b>
                : In progress
                <RenderQnumTree
                  info={inProgressTree}
                  examId={res.id}
                  qpPairs={node.qpPairs}
                  RenderItem={RenderLinkToGrading}
                />
              </li>
            )}
            {node.finished.edges.length > 0 && (
              <li key={`finished-${node.id}`}>
                <b>{`${node.name}`}</b>
                : Finished
                <RenderQnumTree
                  info={finishedTree}
                  examId={res.id}
                  qpPairs={node.qpPairs}
                  RenderItem={RenderLinkToSubmission}
                />
              </li>
            )}
          </ul>
        );
      })}
    </div>
  );
};

const BeginGradingButton: React.FC<{
  examKey: gradingBeginGrading$key;
}> = (props) => {
  const {
    examKey,
  } = props;
  const res = useFragment(
    graphql`
    fragment gradingBeginGrading on Exam {
      examVersions {
        edges {
          node {
            id
            name
            completionSummary
          }
        }
      }
    }
    `,
    examKey,
  );

  const { examVersions } = res;
  const completionStats = examVersions.edges.map(({ node }) => node.completionSummary as {
    notStarted: number;
    inProgress: number;
    finished: number;
  }[][]);
  const { examId } = useParams<{ examId: string }>();
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
  const filtered = examVersions.edges.filter((_ver, index) => !allBlank(completionStats[index]));
  const filteredCompletionStats = completionStats.filter((ver) => !allBlank(ver));
  const chunkSize = 4;
  const versionsInChunks = Array.from(
    { length: Math.ceil(filtered.length / chunkSize) },
    (v, i) => filtered.slice(i * chunkSize, i * chunkSize + chunkSize),
  );
  return (
    <div>
      <h3>Grading progress:</h3>
      <Dropdown>
        <Dropdown.Toggle disabled={loading} id="start-grading-any" variant="primary">
          Begin grading...
        </Dropdown.Toggle>

        <Dropdown.Menu className="pb-0">
          <Dropdown.Item
            className="mb-2"
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
            Whatever is needed
          </Dropdown.Item>
          <div className="grouped-dropdown-holder">
            {versionsInChunks.map((chunk, chunkIndex) => (
              <div
                className="grouped-dropdown-row"
                // eslint-disable-next-line react/no-array-index-key
                key={chunkIndex}
              >
                {chunk.map(({ node }, nodeIndex) => {
                  const index = chunkIndex * chunkSize + nodeIndex;
                  return (
                    // eslint-disable-next-line react/no-array-index-key
                    <div key={index} className="d-inline-block bordered-menu-group">
                      <Dropdown.Header>{node.name}</Dropdown.Header>
                      {filteredCompletionStats[index].map((qStats, qnum) => (!allBlank(qStats) && (
                        qStats.map((pStat, pnum) => (pStat.notStarted > 0 && (
                          <Dropdown.Item
                            // eslint-disable-next-line react/no-array-index-key
                            key={`q${qnum}-p${pnum}`}
                            onClick={() => {
                              mutate({
                                variables: {
                                  input: {
                                    examId,
                                    examVersionId: node.id,
                                    qnum,
                                    pnum,
                                  },
                                },
                              });
                            }}
                          >
                            {qStats.length > 1 ? `Question ${qnum + 1}, part ${alphabetIdx(pnum)}` : `Question ${qnum + 1}`}
                          </Dropdown.Item>
                        )))
                      )))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </Dropdown.Menu>
      </Dropdown>
      {examVersions.edges.map(({ node }, index) => (
        <ul key={node.id} className="d-inline-block align-top">
          <li>
            {node.name}
            <ul>
              {completionStats[index].map((qStats, qnum) => (
                qStats.length > 1 ? (
                  qStats.map((pStat, pnum) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <li key={`q${qnum}-p${pnum}`}>
                      {`Question ${qnum + 1}, part ${alphabetIdx(pnum)}: ${pStat.notStarted} remaining`}
                    </li>
                  ))
                ) : (
                  // eslint-disable-next-line react/no-array-index-key
                  <li key={`q${qnum}-p0`}>{`Question ${qnum + 1}: ${qStats[0].notStarted} remaining`}</li>
                )
              ))}
            </ul>
          </li>
        </ul>
      ))}
    </div>
  );
};

const GradingGrader: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const res = useQuery<gradingGraderQuery>(
    graphql`
    query gradingGraderQuery($examId: ID!) {
      exam(id: $examId) {
        ...gradingBeginGrading
        ...gradingMyGrading
      }
    }
    `,
    { examId },
  );
  if (res.error) {
    return <Container><RenderError error={res.error} /></Container>;
  }
  if (!res.data) {
    return <Container><p>Loading...</p></Container>;
  }
  return (
    <Container>
      <BeginGradingButton examKey={res.data.exam} />
      <MyGrading examKey={res.data.exam} />
    </Container>
  );
};

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
        exam { id }
        user { displayName }
      }
      grader { displayName }
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
      <td><PartName anonymous={false} pnum={lock.pnum} /></td>
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
        <Link
          target="_blank"
          to={`/exams/${lock.registration.exam.id}/submissions/${lock.registration.id}`}
        >
          <Tooltip message="Opens submission in new window">
            <Button variant="info" className="ml-4">
              <Icon I={VscGoToFile} className="mr-2" />
              Show submission
            </Button>
          </Tooltip>
        </Link>
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
      completionSummary
    }
    `,
    versionKey,
  );
  const summary = version.completionSummary as {
    notStarted: number;
    inProgress: number;
    finished: number;
  }[][];
  return (
    <Table>
      <thead>
        <tr>
          {summary.map((qStat, qnum) => (
            <th
              // eslint-disable-next-line react/no-array-index-key
              key={`q${qnum}`}
              className="border-bottom-0 pb-0 text"
              colSpan={qStat.length}
            >
              {`Question ${qnum + 1}`}
            </th>
          ))}
        </tr>
        <tr>
          {summary.map((qStats, qnum) => (
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
          {summary.map((qStats, qnum) => (
            qStats.map((pStat, pnum) => {
              const { notStarted, inProgress, finished } = pStat;
              return (
                // eslint-disable-next-line react/no-array-index-key
                <td key={`q${qnum}-p${pnum}`}>
                  <Tooltip className="bg-info" message="Not started / In progress / Finished">
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
              <Tooltip
                className="bg-info"
                message="Students who actively began their exam"
              >
                <span className="mr-2">{`${version.startedCount} started;`}</span>
              </Tooltip>
              <Tooltip
                className="bg-info"
                message="Students who have been finalized, whether or not they actually started it"
              >
                <span>{`${version.finalizedCount} finalized`}</span>
              </Tooltip>
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
      graded
    }
    `,
    examKey,
  );
  return (
    <>
      {res.examVersions.edges.map(({ node }) => (
        <VersionAdministration key={node.id} versionKey={node} />
      ))}
      {res.graded && (
        <SyncExamToBottlenoseButton /> // move to far right
      )}
    </>
  );
};

const GradingAdmin: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const res = useQuery<gradingAdminQuery>(
    graphql`
    query gradingAdminQuery($examId: ID!) {
      exam(id: $examId) {
        ...gradingExamAdmin
        ...gradingBeginGrading
        ...gradingMyGrading
      }
    }
    `,
    { examId },
  );
  if (res.error) {
    return <Container><RenderError error={res.error} /></Container>;
  }
  if (!res.data) {
    return <Container><p>Loading...</p></Container>;
  }
  return (
    <Container>
      <ExamGradingAdministration examKey={res.data.exam} />
      <BeginGradingButton examKey={res.data.exam} />
      <MyGrading examKey={res.data.exam} />
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
