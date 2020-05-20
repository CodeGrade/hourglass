import React from 'react';
import Code from '@student/containers/questions/Code';
import YesNoInput from '@student/containers/questions/YesNo';
import CodeTag from '@student/containers/questions/CodeTag';
import Text from '@student/containers/questions/Text';
import Matching from '@student/containers/questions/Matching';
import MultipleChoice from '@student/containers/questions/MultipleChoice';
import AllThatApply from '@student/containers/questions/AllThatApply';
import { BodyItem } from '@student/types';
import HTML from '@student/components/HTML';
import { ExhaustiveSwitchError } from '@student/helpers';

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
