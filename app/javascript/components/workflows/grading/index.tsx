import React, { ReactElement, useMemo } from 'react';
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
  FaThumbsDown,
  FaThumbsUp,
} from 'react-icons/fa';
import { MdFeedback } from 'react-icons/md';
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
import DisplayYesNo from '@proctor/registrations/show/questions/DisplayYesNo';
import DisplayText from '@proctor/registrations/show/questions/DisplayText';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import DisplayMatching from '@proctor/registrations/show/questions/DisplayMatching';
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
import { useQuery, useFragment, graphql } from 'relay-hooks';

import { grading_one$key } from './__generated__/grading_one.graphql';
import { QuestionName } from '../student/exams/show/components/ShowQuestion';
import { PartName } from '../student/exams/show/components/Part';
import CustomEditor from '../professor/exams/new/editor/components/CustomEditor';

const Feedback: React.FC<{
  variant: AlertProps['variant'];
}> = ({ variant }) => (
  <Alert
    variant={variant}
    dismissible
  >
    <Row>
      <Form.Group as={Col} lg="auto">
        <Form.Label>Points</Form.Label>
        <Form.Control step={0.5} type="number" min={0} />
      </Form.Group>
      <Form.Group as={Col}>
        <Form.Label>Category</Form.Label>
        <Select options={[]} />
      </Form.Group>
    </Row>
    <Row>
      <Form.Group as={Col}>
        <Form.Label>Comment</Form.Label>
        <Form.Control as="textarea" />
      </Form.Group>
    </Row>
  </Alert>
);

const ItemizedGrades: React.FC = () => (
  <ButtonGroup>
    <Button variant="danger">
      <Icon I={FaThumbsDown} />
    </Button>
    <Button variant="success">
      <Icon I={FaThumbsUp} />
    </Button>
  </ButtonGroup>
);

const PromptRow: React.FC<{
  prompt: HTMLVal;
}> = ({ prompt }) => (
  <Row>
    <Col sm={{ span: 6, offset: 3 }}>
      <HTML value={prompt} />
    </Col>
  </Row>
);

const ItemRubric: React.FC = () => (
  <Alert variant="info" className="pb-0">
    <Row>
      <Col>
        <ButtonGroup className="float-right">
          <Button variant="outline-secondary" size="sm" disabled>rubric-item-label</Button>
          <Button variant="outline-secondary" size="sm" disabled><i>5 points</i></Button>
        </ButtonGroup>
        <HTML value={{ type: 'HTML', value: 'Description of <i>item</i> goes here' }} />
      </Col>
    </Row>
    <Row>
      <Col>
        <p>Suggested comments:</p>
        <div>
          <Alert variant="warning" className="p-0">
            <Tooltip
              showTooltip
              message="Click to apply this message"
            >
              <Button variant="warning" size="sm" className="mr-2 align-self-center"><Icon I={MdFeedback} /></Button>
            </Tooltip>
            (-2 points) Some descriptive text...
          </Alert>
          <Alert variant="warning" className="p-0">
            <Tooltip
              showTooltip
              message="Click to apply this message"
            >
              <Button variant="warning" size="sm" className="mr-2 align-self-center"><Icon I={MdFeedback} /></Button>
            </Tooltip>
            (-5 points) Some more descriptive text...
          </Alert>
          <Alert variant="warning" className="p-0">
            <Tooltip
              showTooltip
              message="Click to apply this message"
            >
              <Button variant="warning" size="sm" className="mr-2 align-self-center"><Icon I={MdFeedback} /></Button>
            </Tooltip>
            (-0.5 points) Some other descriptive text...
          </Alert>
        </div>
      </Col>
    </Row>
  </Alert>
);

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

const ConditionalRubric: React.FC<{ depth: number }> = ({ depth }) => {
  const variants: AlertProps['variant'][] = ['light', 'secondary', 'dark'];
  const variant: AlertProps['variant'] = variants[depth] ?? 'primary';
  return (
    <Alert variant={variant} className="pb-0">
      <Row>
        <Col>
          <HTML value={{ type: 'HTML', value: '<p>The description of this <b>sub-rubric</b></p>' }} />
        </Col>
      </Row>
      <Row>
        <Col>
          {depth <= 0 ? (
            <>
              <ItemRubric />
              <ItemRubric />
            </>
          ) : (
            <>
              <ConditionalRubric depth={depth - 1} />
              <ConditionalRubric depth={depth - 2} />
            </>
          )}
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

const EditRubric: React.FC = () => (
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

const ShowRubric: React.FC = () => (
  <>
    <ItemRubric />
    <ConditionalRubric depth={2} />
  </>
);


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
}

const AnswersRow = <T, V>(props: AnswersRowProps<T, V>): ReactElement => {
  const {
    ShowExpected,
    ShowStudent = ShowExpected,
    info,
    studentAnswer,
    expectedAnswer,
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
            />
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
            <ItemizedGrades />
            <Feedback variant="success" />
            <Feedback variant="danger" />
          </Col>
          <Col md={6}>
            <EditRubric />
            <hr />
            <ShowRubric />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

const GradeBodyItem: React.FC<{
  expectedAnswer: AnswerState;
  studentAnswer: AnswerState;
  info: BodyItem;
  qnum: number;
  pnum: number;
  bnum: number;
}> = (props) => {
  const {
    expectedAnswer,
    studentAnswer,
    info,
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
            info={info}
            ShowExpected={DisplayCode}
            studentAnswer={studentAnswer as CodeState}
            expectedAnswer={expectedAnswer as CodeState}
          />
        </>
      );
    case 'CodeTag':
      return (
        <>
          <PromptRow prompt={info.prompt} />
          <AnswersRow
            info={info}
            ShowExpected={DisplayCodeTag}
            studentAnswer={studentAnswer as CodeTagState}
            expectedAnswer={expectedAnswer as CodeTagState}
          />
        </>
      );
    case 'YesNo':
      return (
        <>
          <PromptRow prompt={info.prompt} />
          <AnswersRow
            info={info}
            ShowExpected={DisplayYesNo}
            studentAnswer={studentAnswer as YesNoState}
            expectedAnswer={expectedAnswer as YesNoState}
          />
        </>
      );
    case 'Text':
      return (
        <>
          <PromptRow prompt={info.prompt} />
          <AnswersRow
            info={info}
            ShowExpected={DisplayText}
            studentAnswer={studentAnswer as TextState}
            expectedAnswer={expectedAnswer as TextState}
          />
        </>
      );
    case 'Matching':
      return (
        <>
          {/* <PromptRow prompt={info.prompt} /> */}
          <AnswersRow
            info={info}
            ShowExpected={DisplayMatching}
            studentAnswer={studentAnswer as MatchingState}
            expectedAnswer={expectedAnswer as MatchingState}
          />
        </>
      );
    case 'AllThatApply':
      return (
        <>
          <PromptRow prompt={info.prompt} />
          <AnswersRow
            info={info}
            ShowExpected={DisplayAllThatApply}
            studentAnswer={studentAnswer as AllThatApplyState}
            expectedAnswer={expectedAnswer as AllThatApplyState}
          />
        </>
      );
    case 'MultipleChoice':
      return (
        <>
          <PromptRow prompt={info.prompt} />
          <AnswersRow
            info={info}
            ShowExpected={DisplayMultipleChoice}
            studentAnswer={studentAnswer as MultipleChoiceState}
            expectedAnswer={expectedAnswer as MultipleChoiceState}
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
  } = props;
  const res = useFragment(
    graphql`
    fragment grading_one on Registration {
      currentAnswers
      examVersion {
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
        {questions.map((q, qnum) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={qnum}>
            <Row>
              <Col sm={{ span: 6, offset: 3 }}>
                <h2><QuestionName qnum={qnum} name={q.name} /></h2>
              </Col>
            </Row>
            {q.parts.map((p, pnum) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={pnum}>
                <Row>
                  <Col sm={{ span: 6, offset: 3 }}>
                    <h3><PartName pnum={pnum} name={p.name} /></h3>
                  </Col>
                </Row>
                {p.body.map((b, bnum) => {
                  const studentAns = currentAnswers.answers[qnum][pnum][bnum];
                  const studentAnswer = isNoAns(studentAns) ? undefined : studentAns;

                  const ans = answers[qnum][pnum][bnum];
                  const expectedAnswer = isNoAns(ans) ? undefined : ans;
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
                    />
                  );
                })}
              </div>
            ))}
          </div>
        ))}
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
  // TODO: only show the one part
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
    // TODO make these all use the same component
    return <p>ERROR</p>;
  }
  if (!res.props) {
    // TODO make these all use the same component
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
          qnum={qnum}
          pnum={pnum}
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
