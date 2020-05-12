import React from 'react';
import Code from '@hourglass/containers/questions/Code';
import YesNoInput from '@hourglass/containers/questions/YesNo';
import CodeTag from '@hourglass/containers/questions/CodeTag';
import Text from '@hourglass/containers/questions/Text';
import Matching from '@hourglass/containers/questions/Matching';
import MultipleChoice from '@hourglass/containers/questions/MultipleChoice';
import AllThatApply from '@hourglass/containers/questions/AllThatApply';
import { BodyItem } from '@hourglass/types';
import HTML from '@hourglass/components/HTML';
import { ExhaustiveSwitchError } from '@hourglass/helpers';

export interface BodyProps {
  body: BodyItem;
  qnum: number;
  pnum: number;
  bnum: number;
}

const Body: React.FC<BodyProps> = (props) => {
  const {
    body, qnum, pnum, bnum,
  } = props;
  switch (body.type) {
    case 'HTML':
      return <HTML value={body.value} />;
    case 'Code':
      return <Code info={body} qnum={qnum} pnum={pnum} bnum={bnum} />;
    case 'AllThatApply':
      return <AllThatApply info={body} qnum={qnum} pnum={pnum} bnum={bnum} />;
    case 'CodeTag':
      return <CodeTag info={body} qnum={qnum} pnum={pnum} bnum={bnum} />;
    case 'YesNo':
      return <YesNoInput info={body} qnum={qnum} pnum={pnum} bnum={bnum} />;
    case 'MultipleChoice':
      return <MultipleChoice info={body} qnum={qnum} pnum={pnum} bnum={bnum} />;
    case 'Text':
      return <Text info={body} qnum={qnum} pnum={pnum} bnum={bnum} />;
    case 'Matching':
      return <Matching info={body} qnum={qnum} pnum={pnum} bnum={bnum} />;
    default:
      throw new ExhaustiveSwitchError(body);
  }
};

export default Body;
