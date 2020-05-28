import React from 'react';
import {
  ToggleButton,
  ToggleButtonGroup,
  Form,
  Row,
  Col,
} from 'react-bootstrap';
import { YesNoInfo, YesNoState } from '@student/exams/show/types';
import Prompted from '@professor/exams/new/editor/components/questions/Prompted';

export interface YesNoProps {
  info: YesNoInfo;
  value: boolean;
  qnum: number;
  pnum: number;
  bnum: number;
  onChange: (newInfo: YesNoInfo, newState: YesNoState) => void;
  disabled: boolean;
}

const YesNo: React.FC<YesNoProps> = (props) => {
  const {
    info,
    value,
    qnum,
    pnum,
    bnum,
    onChange,
    disabled,
  } = props;
  const {
    prompt,
    yesLabel = 'Yes',
    noLabel = 'No',
  } = info;
  const isYesNo = (yesLabel === 'Yes');
  return (
    <>
      <Prompted
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
        prompt={prompt}
        onChange={(newPrompt): void => {
          if (onChange) { onChange({ ...info, prompt: newPrompt }, value); }
        }}
      />
      <Form.Group as={Row} controlId={`${qnum}-${pnum}-${bnum}-yesNo-wording`}>
        <Form.Label column sm={2}>Answer format</Form.Label>
        <Col sm={10}>
          <ToggleButtonGroup
            className="bg-white rounded"
            name="wording"
            type="radio"
            value={isYesNo}
            onChange={(v): void => {
              if (v) {
                onChange({ ...info, yesLabel: 'Yes', noLabel: 'No' }, value);
              } else {
                onChange({ ...info, yesLabel: 'True', noLabel: 'False' }, value);
              }
            }}
          >
            <ToggleButton
              disabled={disabled}
              variant={isYesNo ? 'primary' : 'outline-primary'}
              value
            >
              Yes/No
            </ToggleButton>
            <ToggleButton
              disabled={disabled}
              variant={(isYesNo === false) ? 'primary' : 'outline-primary'}
              value={false}
            >
              True/False
            </ToggleButton>
          </ToggleButtonGroup>
        </Col>
      </Form.Group>
      <Form.Group as={Row} controlId={`${qnum}-${pnum}-${bnum}-yesNo-answer`}>
        <Form.Label column sm={2}>Correct answer</Form.Label>
        <Col sm={10}>
          <ToggleButtonGroup
            className="bg-white rounded"
            name="tbg"
            type="radio"
            value={value}
            onChange={(v): void => onChange(info, !!v)}
          >
            <ToggleButton
              disabled={disabled}
              variant={value ? 'primary' : 'outline-primary'}
              value
            >
              {yesLabel}
            </ToggleButton>
            <ToggleButton
              disabled={disabled}
              variant={(value === false) ? 'primary' : 'outline-primary'}
              value={false}
            >
              {noLabel}
            </ToggleButton>
          </ToggleButtonGroup>
        </Col>
      </Form.Group>
    </>
  );
};

export default YesNo;
