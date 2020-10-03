import React from 'react';
import {
  Row, Col, Form,
} from 'react-bootstrap';
import { TextInfo, TextState } from '@student/exams/show/types';
import HTML from '@student/exams/show/components/HTML';

interface TextProps {
  info: TextInfo;
  value: TextState;
  onChange: (newVal: TextState) => void;
  disabled: boolean;
}

const Text: React.FC<TextProps> = (props) => {
  const {
    info,
    value,
    onChange,
    disabled,
  } = props;
  const { prompt } = info;
  return (
    <>
      <HTML value={prompt} />
      <Row>
        <Col>
          <Form.Control
            disabled={disabled}
            as="textarea"
            spellCheck={false}
            rows={3}
            placeholder="Enter your answer here."
            value={value}
            onChange={(e): void => {
              const elem = e.target as HTMLTextAreaElement;
              onChange(elem.value);
            }}
          />
        </Col>
      </Row>
    </>
  );
};

export default Text;
