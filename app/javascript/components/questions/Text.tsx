import React from 'react';
import {
  Container, Row, Col, Form,
} from 'react-bootstrap';
import { TextInfo, TextState } from '@hourglass/types';
import { HTML } from './HTML';

interface TextProps {
  info: TextInfo;
  value: TextState;
  onChange: (newVal: TextState) => void;
  disabled: boolean;
}

export function Text(props: TextProps) {
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
          {prompt.map((p, i) => <HTML key={i} value={p} />)}
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
            onChange={(e) => {
              const elem = e.target as HTMLTextAreaElement;
              onChange(elem.value);
            }}
          />
        </Col>
      </Row>
    </>
  );
}
