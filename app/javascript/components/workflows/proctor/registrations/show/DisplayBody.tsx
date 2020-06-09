import React, { useContext } from 'react';
import { ExamViewerContext } from '@student/exams/show/context';
import Code from '@student/exams/show/components/questions/Code';
import DisplayYesNoInput from '@proctor/registrations/show/questions/DisplayYesNo';
import DisplayCodeTag from '@proctor/registrations/show/questions/DisplayCodeTag';
import DisplayText from '@proctor/registrations/show/questions/DisplayText';
import DisplayMatching from '@proctor/registrations/show/questions/DisplayMatching';
import DisplayMultipleChoice from '@proctor/registrations/show/questions/DisplayMultipleChoice';
import DisplayAllThatApply from '@proctor/registrations/show/questions/DisplayAllThatApply';
import HTML from '@student/exams/show/components/HTML';
import { BodyProps } from '@student/exams/show/components/Body';
import {
  CodeState, TextState, YesNoState, MultipleChoiceState,
  MatchingState, AllThatApplyState, CodeTagState,
} from '@student/exams/show/types';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import { isNoAns } from '@hourglass/workflows/student/exams/show/containers/questions/connectors';

const DisplayBody: React.FC<BodyProps> = (props) => {
  const {
    body,
    qnum,
    pnum,
    bnum,
  } = props;
  const {
    answers,
  } = useContext(ExamViewerContext);
  const answer = answers.answers[qnum]?.[pnum]?.[bnum];
  const value = isNoAns(answer) ? undefined : answer;

  switch (body.type) {
    case 'HTML':
      return <HTML value={body} />;
    case 'Code':
      return <Code info={body} value={value as CodeState} disabled />;
    case 'AllThatApply':
      return <DisplayAllThatApply info={body} value={value as AllThatApplyState} />;
    case 'CodeTag':
      return <DisplayCodeTag info={body} value={value as CodeTagState} />;
    case 'YesNo':
      return <DisplayYesNoInput info={body} value={value as YesNoState} />;
    case 'MultipleChoice':
      return <DisplayMultipleChoice info={body} value={value as MultipleChoiceState} />;
    case 'Text':
      return <DisplayText info={body} value={value as TextState} />;
    case 'Matching':
      return <DisplayMatching info={body} value={value as MatchingState} />;
    default:
      throw new ExhaustiveSwitchError(body);
  }
};

export default DisplayBody;
