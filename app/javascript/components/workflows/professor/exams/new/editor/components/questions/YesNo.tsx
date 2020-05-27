import React from 'react';
import {
  ToggleButton,
  ToggleButtonGroup,
  Form,
  Row,
  Col,
} from 'react-bootstrap';
import { YesNoInfo } from '@student/exams/show/types';
import CustomEditor from '@professor/exams/new/editor/components/CustomEditor';

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
    <>
      <Form.Group as={Row} controlId={`${qnum}-${pnum}-${bnum}-yesNo-prompt`}>
        <Form.Label column sm={2}>Prompt</Form.Label>
        <Col sm={10}>
          <CustomEditor
            className="bg-white"
            value={prompt}
            placeholder="Prompt for this question"
            onChange={(newPrompt): void => onChange(newPrompt, value)}
          />
        </Col>
      </Form.Group>
      <Form.Group as={Row} controlId={`${qnum}-${pnum}-${bnum}-yesNo-wording`}>
        <Form.Label column sm={2}>Answer format</Form.Label>
        <Col sm={10}>
          <ToggleButtonGroup
            className="bg-white rounded"
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
            className="bg-white rounded"
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
    </>
  );
};

export default YesNo;
