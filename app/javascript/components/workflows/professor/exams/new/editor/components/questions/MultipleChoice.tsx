import React, { useState } from 'react';
import {
  Form,
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import Prompted from '@professor/exams/new/editor/components/questions/Prompted';
import Icon from '@student/exams/show/components/Icon';
import MoveItem from '@professor/exams/new/editor/components/MoveItem';
import {
  FieldArray,
  Field,
  WrappedFieldProps,
  FieldArrayFieldsProps,
} from 'redux-form';
import { FaCircle } from 'react-icons/fa';
import { HTMLVal } from '@student/exams/show/types';
import EditHTMLs, { EditHTMLField } from '@professor/exams/new/editor/components/editHTMLs';

const OneOption: React.FC<{
  selected: boolean;
  onSelect: () => void;
  memberName: string;
  optionNum: number;
  enableDown: boolean;
  moveDown: () => void;
  moveUp: () => void;
  remove: () => void;
}> = (props) => {
  const {
    selected,
    onSelect,
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
        <Button
          variant={selected ? 'dark' : 'outline-dark'}
          onClick={onSelect}
        >
          <Icon I={FaCircle} className={selected ? '' : 'invisible'} />
        </Button>
      </Col>
      <Col className="pr-0">
        <Field name={memberName} component={EditHTMLField} theme="bubble" />
      </Col>
    </Row>
  );
};

export const renderOptionsMultipleChoice = ({
  selected,
  onChange,
  moveDown,
  moveUp,
  remove,
}: {
  selected: number;
  onChange: (idx: number) => void;
  moveDown: () => void;
  moveUp: () => void;
  remove: () => void;
}) => (
  member: string,
  index: number,
  fields: FieldArrayFieldsProps<HTMLVal>,
): JSX.Element => (
  <OneOption
    // eslint-disable-next-line react/no-array-index-key
    key={index}
    selected={selected === index}
    onSelect={() => onChange(index)}
    optionNum={index}
    memberName={member}
    enableDown={index + 1 < fields.length}
    moveDown={(): void => {
      fields.move(index, index + 1);
      moveDown();
    }}
    moveUp={(): void => {
      fields.move(index, index - 1);
      moveUp();
    }}
    remove={(): void => {
      fields.remove(index);
      remove();
    }}
  />
);

const EditAns: React.FC<WrappedFieldProps> = (props) => {
  const {
    input,
  } = props;
  const {
    value,
    onChange,
  } = input;
  const moveDown = () => onChange(value + 1);
  const moveUp = () => onChange(value - 1);
  const remove = () => onChange(0);
  return (
    <FieldArray
      name="options"
      component={EditHTMLs}
      renderOptions={renderOptionsMultipleChoice({
        selected: value,
        onChange,
        moveDown,
        moveUp,
        remove,
      })}
    />
  );
};

interface MultipleChoiceProps {
  qnum: number;
  pnum: number;
  bnum: number;
}

const MultipleChoice: React.FC<MultipleChoiceProps> = (props) => {
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
          <Field name="answer" component={EditAns} />
        </Col>
      </Form.Group>
    </>
  );
};

export default MultipleChoice;
