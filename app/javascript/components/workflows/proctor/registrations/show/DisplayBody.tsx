import React, { useContext } from 'react';
import { ExamViewerContext } from '@hourglass/common/context';
import DisplayCode from '@proctor/registrations/show/questions/DisplayCode';
import DisplayYesNo from '@proctor/registrations/show/questions/DisplayYesNo';
import DisplayCodeTag from '@proctor/registrations/show/questions/DisplayCodeTag';
import DisplayText from '@proctor/registrations/show/questions/DisplayText';
import DisplayMatching from '@proctor/registrations/show/questions/DisplayMatching';
import DisplayMultipleChoice from '@proctor/registrations/show/questions/DisplayMultipleChoice';
import DisplayAllThatApply from '@proctor/registrations/show/questions/DisplayAllThatApply';
import HTML from '@student/exams/show/components/HTML';
import {
  CodeState, TextState, YesNoState, MultipleChoiceState,
  MatchingState, AllThatApplyState, CodeTagState, BodyItem,
} from '@student/exams/show/types';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import { isNoAns } from '@student/exams/show/containers/questions/connectors';
import Prompted from '@proctor/registrations/show/questions/Prompted';
import ShowRubric from '@proctor/registrations/show/ShowRubric';

export interface BodyProps {
  refreshCodeMirrorsDeps: React.DependencyList;
  body: BodyItem;
  qnum: number;
  pnum: number;
  bnum: number;
}

const DisplayBody: React.FC<BodyProps> = (props) => {
  const {
    refreshCodeMirrorsDeps,
    body,
    qnum,
    pnum,
    bnum,
  } = props;
  const {
    answers,
    rubric,
  } = useContext(ExamViewerContext);
  const answer = answers.answers[qnum]?.[pnum]?.[bnum];
  const value = isNoAns(answer) ? undefined : answer;
  const bRubric = rubric?.questions[qnum]?.parts[pnum]?.body[bnum];

  switch (body.type) {
    case 'HTML':
      return <HTML value={body} />;
    case 'Code':
      return (
        <Prompted prompt={body.prompt}>
          <DisplayCode
            info={body}
            value={value as CodeState}
            refreshProps={refreshCodeMirrorsDeps}
          />
          {bRubric && <ShowRubric rubric={bRubric} />}
        </Prompted>
      );
    case 'AllThatApply':
      return (
        <Prompted prompt={body.prompt}>
          <DisplayAllThatApply info={body} value={value as AllThatApplyState} />
          {bRubric && <ShowRubric rubric={bRubric} />}
        </Prompted>
      );
    case 'CodeTag':
      return (
        <Prompted prompt={body.prompt}>
          <DisplayCodeTag info={body} value={value as CodeTagState} />
          {bRubric && <ShowRubric rubric={bRubric} />}
        </Prompted>
      );
    case 'YesNo':
      return (
        <Prompted prompt={body.prompt}>
          <DisplayYesNo info={body} value={value as YesNoState} />
          {bRubric && <ShowRubric rubric={bRubric} />}
        </Prompted>
      );
    case 'MultipleChoice':
      return (
        <Prompted prompt={body.prompt}>
          <DisplayMultipleChoice info={body} value={value as MultipleChoiceState} />
          {bRubric && <ShowRubric rubric={bRubric} />}
        </Prompted>
      );
    case 'Text':
      return (
        <Prompted prompt={body.prompt}>
          <DisplayText info={body} value={value as TextState} />
          {bRubric && <ShowRubric rubric={bRubric} />}
        </Prompted>
      );
    case 'Matching':
      return (
        <Prompted prompt={body.prompt}>
          <DisplayMatching info={body} value={value as MatchingState} />
          {bRubric && <ShowRubric rubric={bRubric} />}
        </Prompted>
      );
    default:
      throw new ExhaustiveSwitchError(body);
  }
};

export default DisplayBody;
