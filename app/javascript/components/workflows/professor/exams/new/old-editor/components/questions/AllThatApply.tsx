import React, { useState } from 'react';
import {
  Form,
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import Prompted from '@professor/exams/new/old-editor/components/questions/Prompted';
import MoveItem from '@professor/exams/new/old-editor/components/MoveItem';
import {
  Field,
  FieldArray,
  FieldArrayFieldsProps,
  WrappedFieldArrayProps,
  WrappedFieldProps,
  FormSection,
} from 'redux-form';
import { EditHTMLField } from '@professor/exams/new/old-editor/components/editHTMLs';
import { AllThatApplyOptionWithAnswer } from '@professor/exams/types';
import Icon from '@student/exams/show/components/Icon';
import { FaCheck } from 'react-icons/fa';

interface AllThatApplyProps {
  qnum: number;
  pnum: number;
  bnum: number;
}

const EditAnswer: React.FC<WrappedFieldProps> = (props) => {
  const { input } = props;
  const {
    value,
    onChange,
  } = input;
  return (
    <Button
      variant={value ? 'dark' : 'outline-dark'}
      onClick={() => onChange(!value)}
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
  const showMovers = (): void => setMoversVisible(true);
  const hideMovers = (): void => setMoversVisible(false);
  return (
    <FormSection name={memberName}>
      <Row
        className="p-2"
        onMouseOver={showMovers}
        onFocus={showMovers}
        onBlur={hideMovers}
        onMouseOut={hideMovers}
      >
        <Col className="flex-grow-01">
          <MoveItem
            visible={moversVisible}
            variant="dark"
            enableUp={optionNum > 0}
            enableDown={enableDown}
            enableDelete
            disabledDeleteMessage=""
            onUp={moveUp}
            onDown={moveDown}
            onDelete={remove}
          />
          <Field name="answer" component={EditAnswer} />
        </Col>
        <Col className="pr-0">
          <Field name="html" component={EditHTMLField} theme="bubble" />
        </Col>
      </Row>
    </FormSection>
  );
};

export const renderOptionsATA = (
  member: string,
  index: number,
  fields: FieldArrayFieldsProps<AllThatApplyOptionWithAnswer>,
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

const EditOption: React.FC<WrappedFieldArrayProps<AllThatApplyOptionWithAnswer>> = (props) => {
  const {
    fields,
  } = props;
  return (
    <>
      {fields.map(renderOptionsATA)}
      <Row className="p-2">
        <Col className="text-center p-0">
          <Button
            variant="dark"
            onClick={(): void => {
              fields.push({
                html: {
                  type: 'HTML',
                  value: '',
                },
                answer: false,
              });
            }}
          >
            Add new option
          </Button>
        </Col>
      </Row>
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
        <Form.Label column sm={2}>Answers</Form.Label>
        <Col sm={10}>
          <Row className="p-2">
            <Col className="flex-grow-01">
              <b>Correct?</b>
            </Col>
            <Col><b>Prompt</b></Col>
          </Row>
          <FieldArray name="options" component={EditOption} props={{ }} />
        </Col>
      </Form.Group>
    </>
  );
};

export default AllThatApply;
