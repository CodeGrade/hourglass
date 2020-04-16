import React from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
interface TextProps {
  text: Text;
  qnum: number;
  pnum: number;
  bnum: number;
}

export function Text(props: TextProps) {
  const { text, qnum, pnum, bnum } = props;
  const { prompt } = text;
  return (
    <Container>
      <Row>
        <Col sm={12}>
          <Form.Control as="textarea" rows="3" placeholder="Enter your answer here"/>
        </Col>
      </Row>
    </Container>
  );
}
