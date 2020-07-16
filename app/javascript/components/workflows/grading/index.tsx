import React, { useMemo, useState, useRef, useContext } from 'react';
import {
  Form,
  Row,
  Col,
  Button,
  Card,
  ButtonGroup,
  Alert,
  AlertProps,
  DropdownButton,
  Dropdown,
} from 'react-bootstrap';
import {
  FaChevronCircleLeft,
  FaChevronCircleRight,
} from 'react-icons/fa';
import { MdFeedback } from 'react-icons/md';
import { RiMessage2Line, RiChatDeleteLine, RiChatCheckLine } from 'react-icons/ri';
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
import { ExamViewerContext, ExamContext } from '@student/exams/show/context';
import { createMap } from '@student/exams/show/files';
import DisplayCode from '@proctor/registrations/show/questions/DisplayCode';
import DisplayCodeTag from '@proctor/registrations/show/questions/DisplayCodeTag';
import GradeYesNo from '@grading/questions/GradeYesNo';
import GradeMatching from '@grading/questions/GradeMatching';
import GradeMultipleChoice from '@grading/questions/GradeMultipleChoice';
import DisplayText from '@proctor/registrations/show/questions/DisplayText';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import DisplayAllThatApply from '@proctor/registrations/show/questions/DisplayAllThatApply';
import DisplayMultipleChoice from '@proctor/registrations/show/questions/DisplayMultipleChoice';
import Tooltip from '@student/exams/show/components/Tooltip';
import Select from 'react-select';
import {
  Link,
  useParams,
  Switch,
  Route,
} from 'react-router-dom';
import { useQuery, useFragment, graphql, useMutation } from 'relay-hooks';
import { QuestionName } from '@student/exams/show/components/ShowQuestion';
import { PartName } from '@student/exams/show/components/Part';
import CustomEditor from '@professor/exams/new/editor/components/CustomEditor';
import DisplayMatching from '@proctor/registrations/show/questions/DisplayMatching';
import DisplayYesNo from '@proctor/registrations/show/questions/DisplayYesNo';
import { RenderError } from '@hourglass/common/boundary';
import ObjectiveGrade from '@grading/questions/ObjectiveGrade';

import { grading_one$key, grading_one$data } from './__generated__/grading_one.graphql';
import { gradingRubric$key, gradingRubric } from './__generated__/gradingRubric.graphql';
import { gradingItemRubric$key, gradingItemRubric$data } from './__generated__/gradingItemRubric.graphql';
import { gradingConditionalRubric$key } from './__generated__/gradingConditionalRubric.graphql';
import { gradingNestedConditionalRubric$key } from './__generated__/gradingNestedConditionalRubric.graphql';
import { AlertContext } from '@hourglass/common/alerts';
import { IconType } from 'react-icons';
import { BsArrowUpRight, BsArrowDownRight } from 'react-icons/bs';

function variantForPoints(points: number): AlertProps['variant'] {
  if (points < 0) return 'danger';
  else if (points > 0) return 'success';
  return 'warning';
}

function iconForPoints(points: number): IconType {
  if (points < 0) return RiChatDeleteLine;
  else if (points > 0) return RiChatCheckLine;
  return RiMessage2Line;
}

const Feedback: React.FC<{
  disabled?: boolean;
  message: string;
  onChangeMessage?: (comment: string) => void;
  points: number;
  onChangePoints?: (pts: number) => void;
  onRemove?: () => void;
}> = (props) => {
  const {
    disabled = false,
    points,
    onChangePoints,
    message,
    onChangeMessage,
    onRemove,
  } = props;
  const variant = variantForPoints(points);
  return (
    <Alert
      variant={variant}
      dismissible
      onClose={onRemove}
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
        <Form.Group as={Col}>
          <Form.Label>Category</Form.Label>
          <Select
            isDisabled={disabled}
            options={[]}
          />
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

type GradingPreset = gradingItemRubric$data['presets'][number];

const ShowPreset: React.FC<{
  preset: GradingPreset;
  registrationId: string;
  qnum: number;
  pnum: number;
  bnum: number;
}> = (props) => {
  const {
    preset,
    registrationId,
    qnum,
    pnum,
    bnum,
  } = props;
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation(
    graphql`
    mutation gradingCreateCommentMutation($input: CreateGradingCommentInput!) {
      createGradingComment(input: $input) {
        gradingComment {
          id
          qnum
          pnum
          bnum
          points
          message
        }
        gradingCommentEdge {
          node {
            id
          }
        }
      }
    }
    `,
    {
      configs: [{
        type: 'RANGE_ADD',
        parentID: registrationId,
        connectionInfo: [{
          key: 'Registration_gradingComments',
          rangeBehavior: 'append',
        }],
        edgeName: 'gradingCommentEdge',
      }],
      onCompleted: () => {
        alert({
          variant: 'success',
          message: 'Comment successfully created.',
        });
      },
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error creating comment.',
          message: err.message,
        });
      },
    },
  );
  const variant = variantForPoints(preset.points);
  const VariantIcon = iconForPoints(preset.points);
  return (
    <Alert variant={variant} className="p-0">
      <Tooltip
        showTooltip
        message="Click to apply this message"
      >
        <Button
          disabled={loading}
          variant={variant}
          size="sm"
          className="mr-2 align-self-center"
          onClick={(): void => {
            mutate({
              variables: {
                input: {
                  registrationId,
                  qnum,
                  pnum,
                  bnum,
                  message: preset.description.value,
                  points: preset.points,
                },
              },
            });
          }}
        >
          <Icon I={VariantIcon} />
        </Button>
      </Tooltip>
      {`(${preset.points} points) `}
      <HTML className="d-inline-block" value={preset.description} />
    </Alert>
  );
};

const ItemRubric: React.FC<{
  itemRubricKey: gradingItemRubric$key;
  registrationId: string;
  qnum: number;
  pnum: number;
  bnum: number;
}> = (props) => {
  const {
    itemRubricKey,
    registrationId,
    qnum,
    pnum,
    bnum,
  } = props;
  const res = useFragment(
    graphql`
    fragment gradingItemRubric on ItemRubric {
      label
      description {
        type
        value
      }
      points
      direction
      presets {
        description {
          type
          value
        }
        points
      }
    }
    `,
    itemRubricKey,
  );
  return (
    <Alert variant="info" className="pb-0">
      <Row>
        <Col>
          <ButtonGroup className="float-right">
            <Button variant="outline-secondary" size="sm" disabled>{res.label}</Button>
            <Button variant="outline-secondary" size="sm" disabled>
              <i>
                {res.direction === 'credit' ? (
                  <>
                    <Icon I={BsArrowUpRight} />
                    {`${res.points} points`}
                  </>
                ) : (
                  <>
                    {res.points}
                    <Icon I={BsArrowDownRight} />
                    points
                  </>
                )}
              </i>
            </Button>
          </ButtonGroup>
          <HTML value={res.description} />
        </Col>
      </Row>
      <Row>
        <Col>
          <p>Suggested comments:</p>
          <div>
            {res.presets?.map((preset) => (
              <ShowPreset
                key={preset.description.value}
                preset={preset}
                registrationId={registrationId}
                qnum={qnum}
                pnum={pnum}
                bnum={bnum}
              />
            ))}
          </div>
        </Col>
      </Row>
    </Alert>
  );
};

const ItemRubricEditor: React.FC = () => (
  <Alert variant="info" className="pb-0 px-3" dismissible>
    <Alert.Heading>Item rubric</Alert.Heading>
    <Row>
      <Form.Group as={Col}>
        <Form.Label>Label</Form.Label>
        <Form.Control as="input" />
      </Form.Group>
      <Form.Group as={Col}>
        <Form.Label>Maximum points</Form.Label>
        <Form.Control step={0.5} type="number" min={0} />
      </Form.Group>
    </Row>
    <Row>
      <Form.Group as={Col}>
        <Form.Label>Instructions</Form.Label>
        <CustomEditor
          className="bg-white"
          theme="bubble"
          value=""
          placeholder="Describe what the grading rules are"
        />
      </Form.Group>
    </Row>
    <Row>
      <Form.Group as={Col} className="mb-0">
        <Form.Label>Presets</Form.Label>
        <div>
          {[1, 2, 3].map((i) => (
            <Alert key={`preset-${i}`} variant="warning" className="pb-0" dismissible>
              <Row>
                <Form.Group as={Col} sm={2}>
                  <Form.Label>Points</Form.Label>
                  <Form.Control step={0.5} type="number" min={0} />
                </Form.Group>
                <Form.Group as={Col} sm={10}>
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" placeholder="Comment for students to see" rows={1} />
                </Form.Group>
              </Row>
            </Alert>
          ))}
        </div>
      </Form.Group>
    </Row>
  </Alert>
);

const ConditionalRubric: React.FC<{
  depth: number;
  conditionalRubricKey: gradingConditionalRubric$key;
}> = (props) => {
  const {
    depth,
    conditionalRubricKey,
    children,
  } = props;
  const res = useFragment(
    graphql`
      fragment gradingConditionalRubric on ConditionalRubric {
        condition {
          type
          value
        }
      }
    `,
    conditionalRubricKey,
  );
  const variants: AlertProps['variant'][] = ['light', 'secondary', 'dark'];
  const variant: AlertProps['variant'] = variants[depth] ?? 'primary';
  return (
    <Alert variant={variant} className="pb-0">
      <Row>
        <Col>
          <HTML value={res.condition} />
        </Col>
      </Row>
      <Row>
        <Col>
          {children}
        </Col>
      </Row>
    </Alert>
  );
};

const ConditionalRubricEditor: React.FC<{ depth: number }> = ({ depth }) => {
  const variants: AlertProps['variant'][] = ['light', 'secondary', 'dark'];
  const variant: AlertProps['variant'] = variants[depth] ?? 'primary';
  return (
    <Alert variant={variant} className="pb-0 px-3" dismissible>
      <Alert.Heading>Conditional rubric</Alert.Heading>
      <Row>
        <Form.Group as={Col}>
          <Form.Label>Condition</Form.Label>
          <CustomEditor
            className="bg-white border-silver border"
            theme="bubble"
            value=""
            placeholder="Describe when to use this sub-rubric"
          />
        </Form.Group>
      </Row>
      <Row>
        <Form.Group as={Col} className="mb-0">
          <Form.Label>Use the following rubric:</Form.Label>
          {depth <= 0 ? (
            <>
              <ItemRubricEditor />
              <ItemRubricEditor />
            </>
          ) : (
            <>
              <ConditionalRubricEditor depth={depth - 1} />
              <ConditionalRubricEditor depth={depth - 2} />
            </>
          )}
        </Form.Group>
      </Row>
    </Alert>
  );
};

export const EditRubric: React.FC = () => (
  <>
    <ItemRubricEditor />
    <ConditionalRubricEditor depth={2} />
    <DropdownButton
      id="add-rubric"
      variant="secondary"
      title="Add new rubric item..."
    >
      <Dropdown.Item>
        Item rubric
      </Dropdown.Item>
      <Dropdown.Item>
        Conditional rubric
      </Dropdown.Item>
    </DropdownButton>
  </>
);

const ShowNestedConditionalRubric: React.FC<{
  conditionalRubricKey: gradingNestedConditionalRubric$key;
  registrationId: string;
  qnum: number;
  pnum: number;
  bnum: number;
}> = (props) => {
  const {
    conditionalRubricKey,
    registrationId,
    qnum,
    pnum,
    bnum,
  } = props;
  const rubric = useFragment(
    graphql`
    fragment gradingNestedConditionalRubric on ConditionalRubric {
      condition {
        value
      }
      ...gradingConditionalRubric
      rubrics {
        __typename
        ... on ConditionalRubric {
          condition {
            value
          }
          ...gradingConditionalRubric
          rubrics {
            ... on ItemRubric {
              label
              ...gradingItemRubric
            }
          }
        }
        ... on ItemRubric {
          label
          ...gradingItemRubric
        }
      }
    }
    `,
    conditionalRubricKey,
  );
  return (
    <ConditionalRubric key={rubric.condition.value} conditionalRubricKey={rubric} depth={2}>
      {rubric.rubrics.map((innerRubric) => {
        // eslint-disable-next-line no-underscore-dangle
        if (innerRubric.__typename === 'ItemRubric') {
          return (
            <ItemRubric
              key={innerRubric.label}
              itemRubricKey={innerRubric}
              registrationId={registrationId}
              qnum={qnum}
              pnum={pnum}
              bnum={bnum}
            />
          );
        }
        // eslint-disable-next-line no-underscore-dangle
        if (innerRubric.__typename === 'ConditionalRubric') {
          return (
            <ConditionalRubric
              key={innerRubric.condition.value}
              conditionalRubricKey={innerRubric}
              depth={1}
            >
              {innerRubric.rubrics.map((innerInnerRubric) => (
                <ItemRubric
                  key={innerInnerRubric.label}
                  itemRubricKey={innerInnerRubric}
                  registrationId={registrationId}
                  qnum={qnum}
                  pnum={pnum}
                  bnum={bnum}
                />
              ))}
            </ConditionalRubric>
          );
        }
        return null;
      })}
    </ConditionalRubric>
  );
};

const ShowRubric: React.FC<{
  examVersionKey: gradingRubric$key;
  qnum: number;
  pnum: number;
  bnum: number;
  registrationId: string;
}> = (props) => {
  const {
    examVersionKey,
    qnum,
    pnum,
    bnum,
    registrationId,
  } = props;
  const res = useFragment(
    graphql`
    fragment gradingRubric on ExamVersion {
      id
      rubrics {
        parts {
          part {
            __typename
            ... on ConditionalRubric {
              condition {
                value
              }
              ...gradingNestedConditionalRubric
            }
            ... on ItemRubric {
              label
              ...gradingItemRubric
            }
          }
          body {
            rubrics {
              __typename
              ... on ConditionalRubric {
                condition {
                  value
                }
                ...gradingNestedConditionalRubric
              }
              ... on ItemRubric {
                label
                ...gradingItemRubric
              }
            }
          }
        }
      }
    }
    `,
    examVersionKey,
  );
  const partRubric = res.rubrics[qnum].parts[pnum].part;
  const bodyRubric = res.rubrics[qnum].parts[pnum].body[bnum].rubrics;
  const showRubric = (rubric: gradingRubric['rubrics'][number]['parts'][number]['part'][number]) => {
    // eslint-disable-next-line no-underscore-dangle
    if (rubric.__typename === 'ItemRubric') {
      return (
        <ItemRubric
          key={rubric.label}
          itemRubricKey={rubric}
          registrationId={registrationId}
          qnum={qnum}
          pnum={pnum}
          bnum={bnum}
        />
      );
    }
    // eslint-disable-next-line no-underscore-dangle
    if (rubric.__typename === 'ConditionalRubric') {
      return (
        <ShowNestedConditionalRubric
          key={rubric.condition.value}
          conditionalRubricKey={rubric}
          registrationId={registrationId}
          qnum={qnum}
          pnum={pnum}
          bnum={bnum}
        />
      );
    }
    return null;
  };
  return (
    <>
      {partRubric.map(showRubric)}
      {bodyRubric.map(showRubric)}
    </>
  );
};

const NewComment: React.FC<{
  message: string;
  points: number;
  onChange: (points: number, message: string) => void;
  onRemove: () => void;
}> = (props) => {
  const {
    message,
    points,
    onChange,
    onRemove,
  } = props;
  return (
    <Feedback
      points={points}
      onChangePoints={(pts) => onChange(pts, message)}
      message={message}
      onChangeMessage={(msg) => onChange(points, msg)}
      onRemove={onRemove}
    />
  );
};

interface NewComment {
  points: number;
  message: string;
}

interface NewCommentMap {
  [id: number]: NewComment;
}

const NewComments: React.FC<{
}> = (props) => {
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
  return (
    <>
      {Object.entries(commentMap).map(([id, { message, points }]) => {
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
        return (
          <NewComment
            key={id}
            message={message}
            points={points}
            onChange={onChange}
            onRemove={onRemove}
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

const BodyItemGrades: React.FC<{
  qnum: number;
  pnum: number;
  bnum: number;
  comments: GradingComment[];
}> = (props) => {
  const {
    qnum,
    pnum,
    bnum,
    comments,
  } = props;
  return (
    <>
      {comments.map((comment) => (
        <Feedback
          key={comment.id}
          disabled
          points={comment.points}
          message={comment.message}
        />
      ))}
      <NewComments />
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
              qnum={qnum}
              pnum={pnum}
              bnum={bnum}
              comments={comments}
            />
          </Col>
          <Col md={6}>
            <ShowRubric
              examVersionKey={examVersionKey}
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
    check,
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
              const comments = res.gradingComments.edges.map(({ node }) => node).filter((comment) => (
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
          <Button>
            Next exam
          </Button>
        </Row>
      </ExamViewerContext.Provider>
    </ExamContext.Provider>
  );
};

const GradeOnePart: React.FC = () => {
  const { registrationId, qnum, pnum } = useParams();
  const res = useQuery(
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
    return <RenderError error={res.error} />;
  }
  if (!res.props) {
    return <p>Loading...</p>;
  }

  return (
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
  );
};

const Grading: React.FC = () => (
  <Switch>
    <Route exact path="/exams/:examId/grading">
      <p>
        TODO: grading homepage that acquires a lock and redirects to grading the single part
      </p>
      <p>
        {'for now, here is '}
        <Link to="/exams/RXhhbS0x/grading/UmVnaXN0cmF0aW9uLTE=/0/0">
          Registration 1 q0 p0
        </Link>
      </p>
    </Route>
    <Route path="/exams/:examId/grading/:registrationId/:qnum/:pnum">
      <GradeOnePart />
    </Route>
  </Switch>
);

export default Grading;
