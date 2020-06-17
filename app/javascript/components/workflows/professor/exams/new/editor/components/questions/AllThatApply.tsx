import React, { useState } from 'react';
import {
  Form,
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import Prompted from '@professor/exams/new/editor/components/questions/Prompted';
import MoveItem from '@professor/exams/new/editor/components/MoveItem';
import {
  Field,
  FieldArray,
  FieldArrayFieldsProps,
  WrappedFieldArrayProps,
} from 'redux-form';
import EditHTMLs, { EditHTMLField } from '@professor/exams/new/editor/components/editHTMLs';
import { HTMLVal } from '@student/exams/show/types';
import Icon from '@student/exams/show/components/Icon';
import { FaCheck } from 'react-icons/fa';

interface AllThatApplyProps {
  qnum: number;
  pnum: number;
  bnum: number;
}

// TODO: add this upstream
declare module 'redux-form' {
  interface FieldArrayFieldsProps<FieldValue> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    splice: (index: number, removeNum: number | null, value: any) => void;
  }
}

const EditAnswer: React.FC<{
  myIdx: number;
} & WrappedFieldArrayProps<boolean>> = (props) => {
  const {
    myIdx,
    fields,
  } = props;
  const value = fields.get(myIdx);
  return (
    <Button
      variant={value ? 'dark' : 'outline-dark'}
      onClick={(): void => fields.splice(myIdx, 1, !value)}
    >
      <Icon I={FaCheck} className={value ? '' : 'invisible'} />
    </Button>
  );
};

const OneOption: React.FC<{
  memberName: string;
  optionNum: number;
  enableDown: boolean;
  moveDown: () => void;
  moveUp: () => void;
  remove: () => void;
}> = (props) => {
  const {
    memberName,
    optionNum,
    enableDown,
    moveDown,
    moveUp,
    remove,
  } = props;
  const [moversVisible, setMoversVisible] = useState(false);
  return (
    <Row
      className="p-2"
      onMouseOver={(): void => setMoversVisible(true)}
      onFocus={(): void => setMoversVisible(true)}
      onBlur={(): void => setMoversVisible(false)}
      onMouseOut={(): void => setMoversVisible(false)}
    >
      <Col className="flex-grow-01">
        <MoveItem
          visible={moversVisible}
          variant="dark"
          enableUp={optionNum > 0}
          enableDown={enableDown}
          onUp={moveUp}
          onDown={moveDown}
          onDelete={remove}
        />
        <FieldArray name="answer" component={EditAnswer} myIdx={optionNum} />
      </Col>
      <Col className="pr-0">
        <Field name={memberName} component={EditHTMLField} theme="bubble" />
      </Col>
    </Row>
  );
};

export const renderOptionsATA = (
  member: string,
  index: number,
  fields: FieldArrayFieldsProps<HTMLVal>,
): JSX.Element => (
  <OneOption
    // eslint-disable-next-line react/no-array-index-key
    key={index}
    optionNum={index}
    memberName={member}
    enableDown={index + 1 < fields.length}
    moveDown={(): void => {
      fields.move(index, index + 1);
    }}
    moveUp={(): void => {
      fields.move(index, index - 1);
    }}
    remove={(): void => {
      fields.remove(index);
    }}
  />
);


const AllThatApply: React.FC<AllThatApplyProps> = (props) => {
  const {
    qnum,
    pnum,
    bnum,
  } = props;
  return (
    <>
      <Prompted
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
      />
      <Form.Group as={Row} controlId={`${qnum}-${pnum}-${bnum}-answer`}>
        <Form.Label column sm={2}>Answers</Form.Label>
        <Col sm={10}>
          <Row className="p-2">
            <Col className="flex-grow-01">
              <b>Correct?</b>
            </Col>
            <Col><b>Prompt</b></Col>
          </Row>
          <FieldArray name="options" component={EditHTMLs} renderOptions={renderOptionsATA} />
        </Col>
      </Form.Group>
    </>
  );
};

export default AllThatApply;
