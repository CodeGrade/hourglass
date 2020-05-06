import React, { useContext } from 'react';
import { ExamViewerContext } from '@hourglass/context';
import Code from '@hourglass/components/questions/Code';
import YesNoInput from '@hourglass/components/questions/YesNo';
import CodeTag from '@hourglass/components/questions/CodeTag';
import Text from '@hourglass/components/questions/Text';
import Matching from '@hourglass/components/questions/Matching';
import MultipleChoice from '@hourglass/components/questions/MultipleChoice';
import AllThatApply from '@hourglass/components/questions/AllThatApply';
import HTML from '@hourglass/components/HTML';
import { BodyProps } from '@hourglass/components/Body';
import {
  CodeState,
} from '@hourglass/types';

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
    // case 'AllThatApply':
    //   return <AllThatApply info={body} />;
    // case 'CodeTag':
    //   return <CodeTag info={body} />;
    // case 'TrueFalse':
    //   return <YesNoInput info={body} yesLabel="True" noLabel="False " />;
    // case 'YesNo':
    //   return <YesNoInput info={body} />;
    // case 'MultipleChoice':
    //   return <MultipleChoice info={body} />;
    // case 'Text':
    //   return <Text info={body} />;
    // case 'Matching':
    //   return <Matching info={body} />;
    default:
    //  throw new Error('invalid question type');
      return <p>TODO</p>;
  }
};

export default DisplayBody;
