import React, { ReactElement, useMemo } from 'react';
import {
  Form,
  Row,
  Col,
  Button,
  Card,
  Table,
  ButtonGroup,
  Alert,
  AlertProps,
} from 'react-bootstrap';
import {
  FaChevronCircleLeft,
  FaChevronCircleRight,
  FaThumbsDown,
  FaThumbsUp,
} from 'react-icons/fa';
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
import Select from 'react-select';
import {
  Link,
  useParams,
  Switch,
  Route,
} from 'react-router-dom';
import { useQuery, useFragment, graphql } from 'relay-hooks';

import { grading_one$key } from './__generated__/grading_one.graphql';

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
      <Card.Body className="p-0">
        <Table>
          <thead>
            <tr>
              <th className="w-50">Student</th>
              <th className="w-50">Rubric</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <ShowStudent
                  info={info}
                  value={studentAnswer}
                />
              </td>
              <td>
                <ShowExpected
                  info={info}
                  value={expectedAnswer}
                />
              </td>
            </tr>
            <tr>
              <td>
                <ItemizedGrades />
                <Feedback variant="success" />
                <Feedback variant="danger" />
              </td>
              <td>etc</td>
            </tr>
          </tbody>
        </Table>
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
                <h2>{`Q ${qnum + 1}`}</h2>
              </Col>
            </Row>
            {q.parts.map((p, pnum) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={pnum}>
                <Row>
                  <Col sm={{ span: 6, offset: 3 }}>
                    <h3>{`P ${pnum + 1}`}</h3>
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
