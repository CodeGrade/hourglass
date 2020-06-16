import React from 'react';
import {
  Form,
  Row,
  Col,
} from 'react-bootstrap';
import CustomEditor from '@professor/exams/new/editor/components/CustomEditor';

export interface EditHTMLProps {
  qnum: number;
  pnum: number;
  bnum: number;
  val: string;
  onChange: (newVal: string) => void;
}

const EditHTML: React.FC<EditHTMLProps> = (props) => {
  const {
    qnum,
    pnum,
    bnum,
    val,
    onChange,
  } = props;
  return (
    <>
      <Form.Group as={Row} controlId={`${qnum}-${pnum}-${bnum}-content`}>
        <Form.Label column sm={2}>Prompt</Form.Label>
        <Col sm={10}>
          <CustomEditor
            className="bg-white"
            value={val}
            placeholder="Body item..."
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

export default EditHTML;
