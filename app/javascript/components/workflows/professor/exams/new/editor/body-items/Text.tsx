import React from 'react';
import {
  Row, Col, Form,
} from 'react-bootstrap';
import Prompted from '@professor/exams/new/editor/body-items/Prompted';
import { TextInfo, TextState } from '@student/exams/show/types';

const Text: React.FC<{
  info: TextInfo,
  id: string,
  disabled?: boolean;
  answer: TextState
}> = (props) => {
  const {
    info,
    answer,
    disabled = false,
  } = props;
  return (
    <>
      <Prompted
        value={info.prompt}
        disabled={disabled}
        onChange={console.log}
      />
      <Form.Group as={Row}>
        <Form.Label column sm={2}>Correct answer</Form.Label>
        <Col sm={10}>
          <Form.Control
            as="textarea"
            rows={3}
            disabled={disabled}
            placeholder="Sketch the intended answer here."
            value={answer ?? ''}
            onChange={console.log}
          />
        </Col>
      </Form.Group>
    </>
  );
};

export default Text;
