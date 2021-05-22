import React from 'react';
import {
  ToggleButton,
  ToggleButtonGroup,
  Form,
  Row,
  Col,
} from 'react-bootstrap';
import Prompted from '@professor/exams/new/editor/body-items/Prompted';
import { YesNoInfo, YesNoState } from '@hourglass/workflows/student/exams/show/types';

const EditLabels: React.FC<{
  value: 'yn' | 'tf',
  onChange: (label: 'yn' | 'tf') => void,
}> = (props) => {
  const {
    value,
    onChange,
  } = props;
  const isYesNo = (value === 'yn');
  return (
    <>
      <Form.Label column sm={2}>Answer format</Form.Label>
      <Col sm={10}>
        <ToggleButtonGroup
          className="bg-white rounded"
          name="wording"
          type="radio"
          value={value}
          onChange={onChange}
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

const EditAnswer: React.FC<{
  answer?: YesNoState,
  yesLabel: string,
  noLabel: string,
  onChange: (answer: YesNoState) => void,
}> = (props) => {
  const {
    answer,
    yesLabel,
    noLabel,
    onChange,
  } = props;
  let tbgVal;
  if (answer === true) {
    tbgVal = 'yes';
  } else if (answer === false) {
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
          onChange={(newVal: 'yes' | 'no') => onChange(newVal === 'yes')}
        >
          <ToggleButton
            variant={answer ? 'primary' : 'outline-primary'}
            value="yes"
          >
            {yesLabel}
          </ToggleButton>
          <ToggleButton
            variant={(answer === false) ? 'primary' : 'outline-primary'}
            value="no"
          >
            {noLabel}
          </ToggleButton>
        </ToggleButtonGroup>
      </Col>
    </>
  );
};

const YesNo: React.FC<{
  info: YesNoInfo,
  id: string,
  answer: YesNoState,
}> = (props) => {
  const {
    info,
    answer,
  } = props;
  return (
    <>
      <Prompted
        value={info.prompt}
        onChange={console.log}
      />
      <Form.Group as={Row}>
        <EditLabels
          value={info.yesLabel === 'Yes' ? 'yn' : 'tf'}
          onChange={console.log}
        />
        {/* <Fields names={['yesLabel', 'noLabel']} component={EditLabels} /> */}
      </Form.Group>
      <Form.Group as={Row}>
        <EditAnswer
          answer={answer}
          yesLabel={info.yesLabel}
          noLabel={info.noLabel}
          onChange={console.log}
        />
        {/* <Fields names={['yesLabel', 'noLabel', 'answer']} component={EditAnswer} /> */}
      </Form.Group>
    </>
  );
};

export default YesNo;
