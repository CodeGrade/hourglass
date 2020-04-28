import React from 'react';
import {
  Container, Row, Col, Form,
} from 'react-bootstrap';
import { Text, TextState } from '../../types';
import { HTML } from './HTML';

interface TextProps {
  info: Text;
  value: TextState;
  onChange: (newVal: TextState) => void;
}

export function Text(props: TextProps) {
  const { info, value, onChange } = props;
  const { prompt } = info;
  return (
    <Container>
      <Row>
        <Col sm={12}>
          {prompt.map((p, i) => <HTML key={i} value={p} />)}
        </Col>
        <Col sm={12}>
          <Form.Control
            as="textarea"
            rows="3"
            placeholder="Enter your answer here"
            value={value}
            onChange={(e) => {
              const elem = e.target as HTMLTextAreaElement;
              onChange(elem.value);
            }}
          />
        </Col>
      </Row>
    </Container>
  );
}
