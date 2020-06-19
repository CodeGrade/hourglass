import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import CustomEditor from '@professor/exams/new/editor/components/CustomEditor';
import { WrappedFieldProps, Field } from 'redux-form';

const EditPrompt: React.FC<WrappedFieldProps & {
  qnum: number;
  pnum: number;
  bnum: number;
}> = (props) => {
  const {
    qnum,
    pnum,
    bnum,
    input,
  } = props;
  const {
    value,
    onChange,
  }: {
    value: string;
    onChange: (newVal: string) => void;
  } = input;
  return (
    <>
      <Form.Group as={Row} controlId={`${qnum}-${pnum}-${bnum}-prompt`}>
        <Form.Label column sm={2}>Prompt</Form.Label>
        <Col sm={10}>
          <CustomEditor
            className="bg-white"
            value={value}
            placeholder="Provide any instructions for this specific item..."
            onChange={(newVal, _delta, source, _editor): void => {
              if (source === 'user') {
                onChange(newVal);
              }
            }}
          />
        </Col>
      </Form.Group>
    </>
  );
};

interface PromptProps {
  qnum: number;
  pnum: number;
  bnum: number;
}

const Prompted: React.FC<PromptProps> = (props) => {
  const {
    qnum,
    pnum,
    bnum,
  } = props;
  return (
    <Field name="prompt.value" component={EditPrompt} qnum={qnum} pnum={pnum} bnum={bnum} />
  );
};

export default Prompted;
