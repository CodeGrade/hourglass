import React, { ReactElement } from 'react';
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
import { useRegistrationsShow } from '@hourglass/common/api/grader/registrations/show';
import {
  HTMLVal,
  ContentsState,
  BodyItem,
  AnswerState,
  TextState,
  AnswersState,
  YesNoState,
  CodeState,
  CodeTagState,
  MatchingState,
  AllThatApplyState,
  MultipleChoiceState,
} from '@student/exams/show/types';
import HTML from '@student/exams/show/components/HTML';
import { useVersionsShow } from '@hourglass/common/api/grader/versions/show';
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
import { useParams } from 'react-router-dom';

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
        <HTML value={info} />
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
  contents: ContentsState;
  answers: AnswersState;
  qnum: number;
  pnum: number;
}> = ({ answers, contents }) => {
  const { files } = contents.exam;
  const fmap = createMap(files);
  return (
    <ExamContext.Provider value={{ files, fmap }}>
      <ExamViewerContext.Provider value={{ answers: contents.answers }}>
        <Row>
          <Col>
            <h1>Exam</h1>
          </Col>
        </Row>
        {contents.exam.questions.map((q, qnum) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={qnum}>
            <h2>{`Q ${qnum + 1}`}</h2>
            {q.parts.map((p, pnum) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={pnum}>
                <h3>{`P ${pnum + 1}`}</h3>
                {p.body.map((b, bnum) => {
                  const ans = answers.answers[qnum][pnum][bnum];
                  const studentAns = contents.answers.answers[qnum][pnum][bnum];
                  const studentAnswer = isNoAns(studentAns) ? undefined : studentAns;
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

const Grading: React.FC = () => {
  const { registrationId, qnum, pnum } = useParams();
  const res = useRegistrationsShow(registrationId);
  const versionRes = useVersionsShow(1);
  if (res.type === 'RESULT' && versionRes.type === 'RESULT') {
    return (
      <Row>
        <Col sm="auto">
          <Icon I={FaChevronCircleLeft} size="3em" />
        </Col>
        <Col className="overflow-auto-y">
          <Grade
            answers={versionRes.response.contents.answers}
            contents={res.response.contents}
            qnum={1}
            pnum={2}
          />
        </Col>
        <Col sm="auto">
          <Icon I={FaChevronCircleRight} size="3em" />
        </Col>
      </Row>
    );
  }
  return null;
};

export default Grading;
