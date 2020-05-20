import React, { useContext } from 'react';
import { ExamViewerContext } from '@student/context';
import Code from '@student/components/questions/Code';
import DisplayYesNoInput from '@student/components/questions/DisplayYesNo';
import DisplayCodeTag from '@student/components/questions/DisplayCodeTag';
import DisplayText from '@student/components/questions/DisplayText';
import DisplayMatching from '@student/components/questions/DisplayMatching';
import DisplayMultipleChoice from '@student/components/questions/DisplayMultipleChoice';
import DisplayAllThatApply from '@student/components/questions/DisplayAllThatApply';
import HTML from '@student/components/HTML';
import { BodyProps } from '@student/components/Body';
import {
  CodeState, TextState, YesNoState, MultipleChoiceState,
  MatchingState, AllThatApplyState, CodeTagState,
} from '@student/types';
import { ExhaustiveSwitchError } from '@student/helpers';

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
  const answer = answers[qnum]?.[pnum]?.[bnum];
  switch (body.type) {
    case 'HTML':
      return <HTML value={body.value} />;
    case 'Code':
      return <Code info={body} value={answer as CodeState} disabled />;
    case 'AllThatApply':
      return <DisplayAllThatApply info={body} value={answer as AllThatApplyState} />;
    case 'CodeTag':
      return <DisplayCodeTag info={body} value={answer as CodeTagState} />;
    case 'YesNo':
      return <DisplayYesNoInput info={body} value={answer as YesNoState} />;
    case 'MultipleChoice':
      return <DisplayMultipleChoice info={body} value={answer as MultipleChoiceState} />;
    case 'Text':
      return <DisplayText info={body} value={answer as TextState} />;
    case 'Matching':
      return <DisplayMatching info={body} value={answer as MatchingState} />;
    default:
      throw new ExhaustiveSwitchError(body);
  }
};

export default DisplayBody;
