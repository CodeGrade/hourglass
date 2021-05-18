import React from 'react';
import Code from '@student/exams/show/containers/questions/Code';
import YesNoInput from '@student/exams/show/containers/questions/YesNo';
import CodeTag from '@student/exams/show/containers/questions/CodeTag';
import Text from '@student/exams/show/containers/questions/Text';
import Matching from '@student/exams/show/containers/questions/Matching';
import MultipleChoice from '@student/exams/show/containers/questions/MultipleChoice';
import AllThatApply from '@student/exams/show/containers/questions/AllThatApply';
import { BodyItem } from '@student/exams/show/types';
import HTML from '@student/exams/show/components/HTML';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';

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
  const { info } = body;
  switch (info.type) {
    case 'HTML':
      return <HTML value={info} />;
    case 'Code':
      return <Code info={body.info} qnum={qnum} pnum={pnum} bnum={bnum} />;
    case 'AllThatApply':
      return <AllThatApply info={body.info} qnum={qnum} pnum={pnum} bnum={bnum} />;
    case 'CodeTag':
      return <CodeTag info={body.info} qnum={qnum} pnum={pnum} bnum={bnum} />;
    case 'YesNo':
      return <YesNoInput info={body.info} qnum={qnum} pnum={pnum} bnum={bnum} />;
    case 'MultipleChoice':
      return <MultipleChoice info={body.info} qnum={qnum} pnum={pnum} bnum={bnum} />;
    case 'Text':
      return <Text info={body.info} qnum={qnum} pnum={pnum} bnum={bnum} />;
    case 'Matching':
      return <Matching info={body.info} qnum={qnum} pnum={pnum} bnum={bnum} />;
    default:
      throw new ExhaustiveSwitchError(info);
  }
};

export default Body;
