import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import CustomEditor from '@professor/exams/new/editor/components/CustomEditor';

interface PromptProps {
  qnum: number;
  pnum: number;
  bnum: number;
  prompt: string;
  onChange?: (newPrompt: string) => void;
}

const Prompted: React.FC<PromptProps> = (props) => {
  const {
    qnum,
    pnum,
    bnum,
    prompt,
    onChange,
  } = props;
  return (
    <>
      <Form.Group as={Row} controlId={`${qnum}-${pnum}-${bnum}-prompt`}>
        <Form.Label column sm={2}>Prompt</Form.Label>
        <Col sm={10}>
          <CustomEditor
            className="bg-white"
            value={prompt}
            placeholder="Body item..."
            onChange={(newVal, _delta, source, _editor): void => {
              if (onChange && source === 'user') {
                onChange(newVal);
              }
            }}
          />
        </Col>
      </Form.Group>
    </>
  );
};

export default Prompted;
