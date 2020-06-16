import React from 'react';
import {
  Form,
  Row,
  Col,
} from 'react-bootstrap';
import CustomEditor from '@professor/exams/new/editor/components/CustomEditor';
import { HTMLVal, AnswerState } from '@hourglass/workflows/student/exams/show/types';

export interface HTMLProps {
  qnum: number;
  pnum: number;
  bnum: number;
  info: HTMLVal;
  onChange: (newInfo: HTMLVal, newState: AnswerState) => void;
}

const EditHTML: React.FC<HTMLProps> = (props) => {
  const {
    qnum,
    pnum,
    bnum,
    info,
    onChange,
  } = props;
  return (
    <>
      <Form.Group as={Row} controlId={`${qnum}-${pnum}-${bnum}-content`}>
        <Form.Label column sm={2}>Prompt</Form.Label>
        <Col sm={10}>
          <CustomEditor
            className="bg-white"
            value={info.value}
            placeholder="Body item..."
            onChange={(newVal, _delta, source, _editor): void => {
              if (source === 'user') {
                onChange({
                  type: 'HTML',
                  value: newVal,
                }, { NO_ANS: true });
              }
            }}
          />
        </Col>
      </Form.Group>
    </>
  );
};

export default EditHTML;
