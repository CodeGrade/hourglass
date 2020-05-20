import React from 'react';
import {
  Row, Col, Form,
} from 'react-bootstrap';
import { TextInfo, TextState } from '@student/types';
import HTML from '@student/components/HTML';

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
      <Row>
        <Col>
          {prompt.map((p, i) => (
            <HTML
              // Prompt indices are STATIC.
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              value={p}
            />
          ))}
        </Col>
      </Row>
      <Row>
        <Col>
          <Form.Control
            disabled={disabled}
            as="textarea"
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
