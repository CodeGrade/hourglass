import React, { useState } from 'react';
import Code from '@professor/exams/new/editor/containers/questions/Code';
import YesNoInput from '@professor/exams/new/editor/containers/questions/YesNo';
import CodeTag from '@professor/exams/new/editor/containers/questions/CodeTag';
import Text from '@professor/exams/new/editor/containers/questions/Text';
import Matching from '@professor/exams/new/editor/containers/questions/Matching';
import MultipleChoice from '@professor/exams/new/editor/containers/questions/MultipleChoice';
import AllThatApply from '@professor/exams/new/editor/containers/questions/AllThatApply';
import EditHTML from '@professor/exams/new/editor/containers/EditHTML';
import { BodyItem } from '@student/exams/show/types';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import { MoveBodyItemAction, DeleteBodyItemAction } from '@professor/exams/new/types';
import { moveBodyItem, deleteBodyItem } from '@professor/exams/new/actions';
import MoveItem from '@professor/exams/new/editor/containers/MoveItem';
import { Card } from 'react-bootstrap';


export interface BodyProps {
  body: BodyItem;
  qnum: number;
  pnum: number;
  bnum: number;
  numBodyItems: number;
}

const Body: React.FC<BodyProps> = (props) => {
  const {
    body, qnum, pnum, bnum,
  } = props;
  switch (body.type) {
    case 'HTML':
      return <EditHTML info={body} qnum={qnum} pnum={pnum} bnum={bnum} />;
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

const WrappedBody: React.FC<BodyProps> = (props) => {
  const {
    qnum,
    pnum,
    bnum,
    numBodyItems,
  } = props;
  const [moversVisible, setMoversVisible] = useState(false);
  return (
    <Card
      className="border border-secondary alert-secondary mb-3"
      onMouseOver={(): void => setMoversVisible(true)}
      onFocus={(): void => setMoversVisible(true)}
      onMouseOut={(): void => setMoversVisible(false)}
      onBlur={(): void => setMoversVisible(false)}
    >
      <MoveItem
        visible={moversVisible}
        variant="secondary"
        enableUp={bnum > 0}
        enableDown={bnum + 1 < numBodyItems}
        onUp={(): MoveBodyItemAction => moveBodyItem(qnum, pnum, bnum, bnum - 1)}
        onDown={(): MoveBodyItemAction => moveBodyItem(qnum, pnum, bnum, bnum + 1)}
        onDelete={(): DeleteBodyItemAction => deleteBodyItem(qnum, pnum, bnum)}
      />
      <Card.Body>{Body(props)}</Card.Body>
    </Card>
  );
};

export default WrappedBody;
