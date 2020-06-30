import React, { ReactElement } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { FaChevronCircleLeft, FaChevronCircleRight } from 'react-icons/fa';
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
    <Row>
      <Col>
        <ShowStudent
          info={info}
          value={studentAnswer}
        />
      </Col>
      <Col>
        <ShowExpected
          info={info}
          value={expectedAnswer}
        />
      </Col>
    </Row>
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
                  const expectedAnswer = isNoAns(ans) ? undefined : ans;
                  return (
                    <React.Fragment
                      // eslint-disable-next-line react/no-array-index-key
                      key={bnum}
                    >
                      <GradeBodyItem
                        info={b}
                        studentAnswer={contents.answers.answers[qnum][pnum][bnum]}
                        expectedAnswer={expectedAnswer}
                        qnum={qnum}
                        pnum={pnum}
                        bnum={bnum}
                      />
                      <Row className="bg-light">
                        <Col>
                          grading
                        </Col>
                        <Col>
                          rubric
                        </Col>
                      </Row>
                    </React.Fragment>
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

export default () => {
  const res = useRegistrationsShow(1);
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
