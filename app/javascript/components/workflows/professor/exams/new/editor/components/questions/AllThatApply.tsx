import React from 'react';
import {
  Form,
  Row,
} from 'react-bootstrap';
import Prompted from '@professor/exams/new/editor/components/questions/Prompted';
import {
  FieldArray,
} from 'redux-form';
import EditHTMLs from '../editHTMLs';
import { renderOptionsMultipleChoice } from './MultipleChoice';
// TODO: import { FaCheck } from 'react-icons/fa';
// and make this answer an array of numbers

interface AllThatApplyProps {
  qnum: number;
  pnum: number;
  bnum: number;
}

const AllThatApply: React.FC<AllThatApplyProps> = (props) => {
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
        <FieldArray name="options" component={EditHTMLs} renderOptions={renderOptionsMultipleChoice} />
      </Form.Group>
    </>
  );
};

export default AllThatApply;
