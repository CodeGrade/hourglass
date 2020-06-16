import React, { useState } from 'react';
import Code from '@professor/exams/new/editor/components/questions/Code';
import YesNoInput from '@professor/exams/new/editor/components/questions/YesNo';
import CodeTag from '@professor/exams/new/editor/components/questions/CodeTag';
import Text from '@professor/exams/new/editor/components/questions/Text';
import Matching from '@professor/exams/new/editor/components/questions/Matching';
import MultipleChoice from '@professor/exams/new/editor/components/questions/MultipleChoice';
import AllThatApply from '@professor/exams/new/editor/components/questions/AllThatApply';
import EditHTML from '@professor/exams/new/editor/components/EditHTML';
import { BodyItem } from '@student/exams/show/types';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import { Card } from 'react-bootstrap';
import { Field, WrappedFieldProps } from 'redux-form';
import MoveItem from '@professor/exams/new/editor/components/MoveItem';


const OneItem: React.FC<{
  qnum: number;
  pnum: number;
  bnum: number;
} & WrappedFieldProps> = (props) => {
  const {
    input,
    qnum,
    pnum,
    bnum,
  } = props;
  const {
    value,
    onChange,
  }: {
    value: BodyItem;
    onChange: (newVal: BodyItem) => void;
  } = input;
  switch (value.type) {
    case 'HTML':
      return <EditHTML info={value} onChange={onChange} qnum={qnum} pnum={pnum} bnum={bnum} />;
    case 'Code':
      return <Code info={value} onChange={onChange} qnum={qnum} pnum={pnum} bnum={bnum} />;
    // case 'AllThatApply':
    //   return <AllThatApply info={value} qnum={qnum} pnum={pnum} bnum={bnum} />;
    case 'CodeTag':
      return <CodeTag info={value} onChange={onChange} qnum={qnum} pnum={pnum} bnum={bnum} />;
    // case 'YesNo':
    //   return <YesNoInput info={value} qnum={qnum} pnum={pnum} bnum={bnum} />;
    // case 'MultipleChoice':
    //   return <MultipleChoice info={value} qnum={qnum} pnum={pnum} bnum={bnum} />;
    // case 'Text':
    //   return <Text info={value} qnum={qnum} pnum={pnum} bnum={bnum} />;
    // case 'Matching':
    //   return <Matching info={value} qnum={qnum} pnum={pnum} bnum={bnum} />;
    default:
      return <p>TODO: body ({value.type})</p>;
      // throw new ExhaustiveSwitchError(value);
  }
};

export interface BodyProps {
  memberName: string;
  qnum: number;
  pnum: number;
  bnum: number;
  enableDown: boolean;
  moveDown: () => void;
  moveUp: () => void;
  remove: () => void;
}

const Body: React.FC<BodyProps> = (props) => {
  const {
    qnum,
    pnum,
    bnum,
    memberName,
    enableDown,
    moveDown,
    moveUp,
    remove,
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
        enableDown={enableDown}
        onUp={moveUp}
        onDown={moveDown}
        onDelete={remove}
      />
      <Card.Body>
        <Field name={memberName} component={OneItem} props={{ qnum, pnum, bnum }} />
      </Card.Body>
    </Card>
  );
};

export default Body;
