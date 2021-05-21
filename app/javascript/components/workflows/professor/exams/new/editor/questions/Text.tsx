import React from 'react';
import {
  Row, Col, Form,
} from 'react-bootstrap';
import Prompted from '@hourglass/workflows/professor/exams/new/old-editor/components/questions/Prompted';
import { Field } from 'redux-form';

interface TextProps {
  qnum: number;
  pnum: number;
  bnum: number;
}

const Text: React.FC<TextProps> = (props) => {
  const {
    qnum,
    pnum,
    bnum,
  } = props;
  return (
    <>
      <Prompted
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
      />
      <Form.Group as={Row} controlId={`${qnum}-${pnum}-${bnum}-prompt`}>
        <Form.Label column sm={2}>Correct answer</Form.Label>
        <Col sm={10}>
          <Field
            name="answer"
            component={({ input }) => (
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Sketch the intended answer here."
                value={input.value ?? ''}
                onChange={input.onChange}
              />
            )}
          />
        </Col>
      </Form.Group>
    </>
  );
};

export default Text;
