import React from 'react';
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
import Code from '@student/exams/show/components/questions/Code';
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
          <Row>
            <Col>
              <Code
                info={info}
                value={studentAnswer as CodeState}
                disabled
                autosize
              />
            </Col>
            <Col>
              <Code
                info={info}
                value={expectedAnswer as CodeState}
                disabled
                autosize
              />
            </Col>
          </Row>
        </>
      );
    case 'CodeTag':
      return (
        <>
          <PromptRow prompt={info.prompt} />
          <Row>
            <Col>
              <DisplayCodeTag
                info={info}
                value={studentAnswer as CodeTagState}
              />
            </Col>
            <Col>
              <DisplayCodeTag
                info={info}
                value={expectedAnswer as CodeTagState}
              />
            </Col>
          </Row>
        </>
      );
    case 'YesNo':
      return (
        <>
          <PromptRow prompt={info.prompt} />
          <Row>
            <Col>
              <DisplayYesNo
                info={info}
                value={studentAnswer as YesNoState}
              />
            </Col>
            <Col>
              <DisplayYesNo
                info={info}
                value={expectedAnswer as YesNoState}
              />
            </Col>
          </Row>
        </>
      );
    case 'Text':
      return (
        <>
          <PromptRow prompt={info.prompt} />
          <Row>
            <Col>
              <DisplayText
                info={info}
                value={studentAnswer as TextState}
              />
            </Col>
            <Col>
              <DisplayText
                info={info}
                value={expectedAnswer as TextState}
              />
            </Col>
          </Row>
        </>
      );
    case 'Matching':
      return (
        <>
          {/* <PromptRow prompt={info.prompt} /> */}
          <Row>
            <Col>
              <DisplayMatching
                info={info}
                value={studentAnswer as MatchingState}
              />
            </Col>
            <Col>
              <DisplayMatching
                info={info}
                value={expectedAnswer as MatchingState}
              />
            </Col>
          </Row>
        </>
      );
    case 'AllThatApply':
      return (
        <>
          <PromptRow prompt={info.prompt} />
          <Row>
            <Col>
              <DisplayAllThatApply
                info={info}
                value={studentAnswer as AllThatApplyState}
              />
            </Col>
            <Col>
              <DisplayAllThatApply
                info={info}
                value={expectedAnswer as AllThatApplyState}
              />
            </Col>
          </Row>
        </>
      );
    case 'MultipleChoice':
      return (
        <>
          <PromptRow prompt={info.prompt} />
          <Row>
            <Col>
              <DisplayMultipleChoice
                info={info}
                value={studentAnswer as MultipleChoiceState}
              />
            </Col>
            <Col>
              <DisplayMultipleChoice
                info={info}
                value={expectedAnswer as MultipleChoiceState}
              />
            </Col>
          </Row>
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
          <div key={qnum}>
            <h2>Q {qnum+1}</h2>
            {q.parts.map((p, pnum) => (
              <div key={pnum}>
                <h3>P {pnum + 1}</h3>
                {p.body.map((b, bnum) => {
                  const ans = answers.answers[qnum][pnum][bnum];
                  const expectedAnswer = isNoAns(ans) ? undefined : ans;
                  return (
                    <>
                      <GradeBodyItem
                        key={bnum}
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
                    </>
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
  } else {
    return null;
  }
};
