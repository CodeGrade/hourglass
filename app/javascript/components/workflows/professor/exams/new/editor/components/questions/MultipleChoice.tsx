import React from 'react';
import {
  Row,
  Form,
} from 'react-bootstrap';
import Prompted from '@professor/exams/new/editor/components/questions/Prompted';
// TODO: import { FaCircle } from 'react-icons/fa';
import { FieldArray } from 'redux-form';
import { ShowOptions } from './AllThatApply';

interface MultipleChoiceProps {
  qnum: number;
  pnum: number;
  bnum: number;
}

const MultipleChoice: React.FC<MultipleChoiceProps> = (props) => {
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
      <Form.Group as={Row} controlId={`${qnum}-${pnum}-${bnum}-answer`}>
        <FieldArray name="options" component={ShowOptions} />
      </Form.Group>
    </>
  );
};

export default MultipleChoice;
