import React, { useState } from 'react';
import {
  Row,
  Col,
  Form,
  Button,
} from 'react-bootstrap';
import { MultipleChoiceInfo, MultipleChoiceState, HTMLVal } from '@student/exams/show/types';
import Prompted from '@professor/exams/new/editor/components/questions/Prompted';
import CustomEditor from '@professor/exams/new/editor/components/CustomEditor';
// import MoveItem from '@professor/exams/new/editor/containers/MoveItem';
import { FaCircle } from 'react-icons/fa';
import Icon from '@student/exams/show/components/Icon';
import { UpdateBodyItemAction } from '@professor/exams/new/types';
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
