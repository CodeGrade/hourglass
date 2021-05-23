import React from 'react';
import {
  ToggleButton,
  ToggleButtonGroup,
  Form,
  Row,
  Col,
} from 'react-bootstrap';
import Prompted from '@professor/exams/new/old-editor/components/questions/Prompted';
import { Fields, WrappedFieldsProps } from 'redux-form';

const EditLabels: React.FC<WrappedFieldsProps> = (props) => {
  const {
    yesLabel,
    noLabel,
  } = props;
  const isYesNo = (yesLabel.input.value === 'Yes');
  return (
    <>
      <Form.Label column sm={2}>Answer format</Form.Label>
      <Col sm={10}>
        <ToggleButtonGroup
          className="bg-white rounded"
          name="wording"
          type="radio"
          value={isYesNo ? 'yn' : 'tf'}
          onChange={(v: 'yn' | 'tf'): void => {
            if (v === 'yn') {
              yesLabel.input.onChange('Yes');
              noLabel.input.onChange('No');
            } else {
              yesLabel.input.onChange('True');
              noLabel.input.onChange('False');
            }
          }}
        >
          <ToggleButton
            variant={isYesNo ? 'primary' : 'outline-primary'}
            value="yn"
          >
            Yes/No
          </ToggleButton>
          <ToggleButton
            variant={(isYesNo === false) ? 'primary' : 'outline-primary'}
            value="tf"
          >
            True/False
          </ToggleButton>
        </ToggleButtonGroup>
      </Col>
    </>
  );
};

const EditAnswer: React.FC<WrappedFieldsProps> = (props) => {
  const {
    answer,
    yesLabel,
    noLabel,
  } = props;
  let tbgVal;
  if (answer.input.value === true) {
    tbgVal = 'yes';
  } else if (answer.input.value === false) {
    tbgVal = 'no';
  }
  return (
    <>
      <Form.Label column sm={2}>Correct answer</Form.Label>
      <Col sm={10}>
        <ToggleButtonGroup
          className="bg-white rounded"
          name="tbg"
          type="radio"
          value={tbgVal}
          onChange={(newVal: 'yes' | 'no') => answer.input.onChange(newVal === 'yes')}
        >
          <ToggleButton
            variant={answer.input.value ? 'primary' : 'outline-primary'}
            value="yes"
          >
            {yesLabel.input.value}
          </ToggleButton>
          <ToggleButton
            variant={(answer.input.value === false) ? 'primary' : 'outline-primary'}
            value="no"
          >
            {noLabel.input.value}
          </ToggleButton>
        </ToggleButtonGroup>
      </Col>
    </>
  );
};

export interface YesNoProps {
  qnum: number;
  pnum: number;
  bnum: number;
}

const YesNo: React.FC<YesNoProps> = (props) => {
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
      <Form.Group as={Row} controlId={`${qnum}-${pnum}-${bnum}-yesNo-wording`}>
        <Fields names={['yesLabel', 'noLabel']} component={EditLabels} />
      </Form.Group>
      <Form.Group as={Row} controlId={`${qnum}-${pnum}-${bnum}-yesNo-answer`}>
        <Fields names={['yesLabel', 'noLabel', 'answer']} component={EditAnswer} />
      </Form.Group>
    </>
  );
};

export default YesNo;
