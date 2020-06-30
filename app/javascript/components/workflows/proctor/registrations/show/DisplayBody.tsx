import React, { useContext } from 'react';
import { ExamViewerContext } from '@student/exams/show/context';
import Code from '@student/exams/show/components/questions/Code';
import DisplayYesNo from '@proctor/registrations/show/questions/DisplayYesNo';
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
import { isNoAns } from '@student/exams/show/containers/questions/connectors';
import Prompted from '@proctor/registrations/show/questions/Prompted';

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
      return (
        <Prompted prompt={body.prompt}>
          <Code info={body} value={value as CodeState} disabled autosize />
        </Prompted>
      );
    case 'AllThatApply':
      return (
        <Prompted prompt={body.prompt}>
          <DisplayAllThatApply info={body} value={value as AllThatApplyState} />
        </Prompted>
      );
    case 'CodeTag':
      return (
        <Prompted prompt={body.prompt}>
          <DisplayCodeTag info={body} value={value as CodeTagState} />
        </Prompted>
      );
    case 'YesNo':
      return (
        <Prompted prompt={body.prompt}>
          <DisplayYesNo info={body} value={value as YesNoState} />
        </Prompted>
      );
    case 'MultipleChoice':
      return (
        <Prompted prompt={body.prompt}>
          <DisplayMultipleChoice info={body} value={value as MultipleChoiceState} />
        </Prompted>
      );
    case 'Text':
      return (
        <Prompted prompt={body.prompt}>
          <DisplayText info={body} value={value as TextState} />
        </Prompted>
      );
    case 'Matching':
      // TODO: prompt me
      return <DisplayMatching info={body} value={value as MatchingState} />;
    default:
      throw new ExhaustiveSwitchError(body);
  }
};

export default DisplayBody;
