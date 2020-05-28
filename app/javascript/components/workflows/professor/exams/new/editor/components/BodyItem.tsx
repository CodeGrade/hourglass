import React from 'react';
import Code from '@professor/exams/new/editor/containers/questions/Code';
import YesNoInput from '@professor/exams/new/editor/containers/questions/YesNo';
import CodeTag from '@professor/exams/new/editor/containers/questions/CodeTag';
import Text from '@professor/exams/new/editor/containers/questions/Text';
import Matching from '@professor/exams/new/editor/containers/questions/Matching';
import MultipleChoice from '@professor/exams/new/editor/containers/questions/MultipleChoice';
import AllThatApply from '@professor/exams/new/editor/containers/questions/AllThatApply';
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
