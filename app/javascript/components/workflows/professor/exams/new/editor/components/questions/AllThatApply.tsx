import React, { useState } from 'react';
import {
  Form,
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import {
  HTMLVal,
} from '@student/exams/show/types';
import Prompted from '@professor/exams/new/editor/components/questions/Prompted';
import CustomEditor from '@professor/exams/new/editor/components/CustomEditor';
import { FaCheck } from 'react-icons/fa';
import Icon from '@student/exams/show/components/Icon';
import MoveItem from '@professor/exams/new/editor/components/MoveItem';
import {
  FieldArray,
  WrappedFieldArrayProps,
  FormSection,
  Field,
  WrappedFieldProps,
} from 'redux-form';

interface AllThatApplyProps {
  qnum: number;
  pnum: number;
  bnum: number;
}

const EditOption: React.FC<WrappedFieldProps> = (props) => {
  const { input } = props;
  const {
    value,
    onChange,
  } = input;
  return (
    <CustomEditor
      className="bg-white"
      theme="bubble"
      value={value}
      onChange={(newName, _delta, source, _editor): void => {
        if (source === 'user') {
          onChange({
            type: 'HTML',
            value: newName,
          });
        }
      }}
    />
  );
};

const EditAnswer: React.FC<WrappedFieldProps & {
  current: number;
}> = (props) => {
  const {
    input,
    current,
  } = props;
  const selected = input.value === current;
  return (
    <Button
      variant={selected ? 'dark' : 'outline-dark'}
      onClick={(): void => input.onChange(current)}
    >
      <Icon I={FaCheck} className={selected ? '' : 'invisible'} />
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
        <Field name="answer" component={EditAnswer} current={optionNum} />
      </Col>
      <Col className="pr-0">
        <FormSection name={memberName}>
          <Field name="value" component={EditOption} />
        </FormSection>
      </Col>
    </Row>
  );
};

const renderOptions = (member, index, fields) => (
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

export const ShowOptions: React.FC<WrappedFieldArrayProps<HTMLVal>> = (props) => {
  const {
    fields,
  } = props;
  return (
    <>
      <Form.Label column sm={2}>Answers</Form.Label>
      <Col sm={10}>
        <Row className="p-2">
          <Col className="flex-grow-01">
            <b>Correct?</b>
          </Col>
          <Col><b>Prompt</b></Col>
        </Row>
        {fields.map(renderOptions)}
        <Row className="p-2">
          <Col className="text-center p-0">
            <Button
              variant="dark"
              onClick={(): void => {
                fields.push({
                  type: 'HTML',
                  value: '',
                });
              }}
            >
              Add new option
            </Button>
          </Col>
        </Row>
      </Col>
    </>
  );
};

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
        <FieldArray name="options" component={ShowOptions} />
      </Form.Group>
    </>
  );
};

export default AllThatApply;
