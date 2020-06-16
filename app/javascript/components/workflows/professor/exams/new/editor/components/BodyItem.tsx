import React, { useState } from 'react';
import Code from '@professor/exams/new/editor/components/questions/Code';
import YesNo from '@professor/exams/new/editor/components/questions/YesNo';
import CodeTag from '@professor/exams/new/editor/components/questions/CodeTag';
import Text from '@professor/exams/new/editor/components/questions/Text';
import Matching from '@professor/exams/new/editor/components/questions/Matching';
import MultipleChoice from '@professor/exams/new/editor/components/questions/MultipleChoice';
import AllThatApply from '@professor/exams/new/editor/components/questions/AllThatApply';
import EditHTML from '@professor/exams/new/editor/components/EditHTML';
import { BodyItem, HTMLVal } from '@student/exams/show/types';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import { Card } from 'react-bootstrap';
import { Field, WrappedFieldProps, FormSection, Fields } from 'redux-form';
import MoveItem from '@professor/exams/new/editor/components/MoveItem';

interface Nums {
  qnum: number;
  pnum: number;
  bnum: number;
}

const BodyHTML: React.FC<WrappedFieldProps & Nums> = (props) => {
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
    value: HTMLVal['value'];
    onChange: (newVal: HTMLVal['value']) => void;
  } = input;
  return (
    <EditHTML val={value} onChange={onChange} qnum={qnum} pnum={pnum} bnum={bnum} />
  );
};

const OneItem: React.FC<WrappedFieldProps & Nums> = (props) => {
  const {
    input,
    qnum,
    pnum,
    bnum,
  } = props;
  const {
    value,
  }: {
    value: BodyItem['type'];
  } = input;
  switch (value) {
    case 'HTML':
      return (
        <Field
          name="value"
          component={BodyHTML}
          qnum={qnum}
          pnum={pnum}
          bnum={bnum}
        />
      );
    case 'Code':
      return <Code qnum={qnum} pnum={pnum} bnum={bnum} />;
    case 'AllThatApply':
      return <AllThatApply qnum={qnum} pnum={pnum} bnum={bnum} />;
    case 'CodeTag':
      return <CodeTag qnum={qnum} pnum={pnum} bnum={bnum} />;
    case 'YesNo':
      return <YesNo qnum={qnum} pnum={pnum} bnum={bnum} />;
    case 'MultipleChoice':
      return <MultipleChoice qnum={qnum} pnum={pnum} bnum={bnum} />;
    case 'Text':
      return <Text qnum={qnum} pnum={pnum} bnum={bnum} />;
    // case 'Matching':
    //   return <Matching info={value} qnum={qnum} pnum={pnum} bnum={bnum} />;
    default:
      return <p>TODO: body ({value})</p>;
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
        <FormSection name={memberName}>
          <Field name="type" component={OneItem} props={{ qnum, pnum, bnum }} />
        </FormSection>
      </Card.Body>
    </Card>
  );
};

export default Body;
