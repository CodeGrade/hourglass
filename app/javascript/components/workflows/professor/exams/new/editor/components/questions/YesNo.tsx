import React from 'react';
import {
  ToggleButton,
  ToggleButtonGroup,
  Form,
  Row,
  Col,
  Card,
} from 'react-bootstrap';
import { YesNoInfo } from '@student/exams/show/types';

export interface YesNoProps {
  info: YesNoInfo;
  value: boolean;
  qnum: number;
  pnum: number;
  bnum: number;
  onChange: (prompt: string, newValue: boolean) => void;
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
  return (
    <Card>
      <Card.Body>
        <Form.Group as={Row} controlId={`${qnum}-${pnum}-${bnum}-yesNo-prompt`}>
          <Form.Label column sm={2}>Prompt</Form.Label>
          <Col sm={10}>
            <Form.Control
              type="input"
              value={prompt}
              placeholder="Prompt for this question"
              onChange={(e): void => onChange(e.target.value, value)}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId={`${qnum}-${pnum}-${bnum}-yesNo-wording`}>
          <Form.Label column sm={2}>Answer format</Form.Label>
          <Col sm={10}>
            <ToggleButtonGroup
              name="wording"
              type="radio"
              value={value}
              onChange={(v): void => onChange(prompt, v)}
            >
              <ToggleButton
                disabled={disabled}
                variant={value ? 'primary' : 'outline-primary'}
                value
              >
                Yes/No
              </ToggleButton>
              <ToggleButton
                disabled={disabled}
                variant={(value === false) ? 'primary' : 'outline-primary'}
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
              name="tbg"
              type="radio"
              value={value}
              onChange={(v): void => onChange(prompt, v)}
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
      </Card.Body>
    </Card>
  );
};

export default YesNo;
