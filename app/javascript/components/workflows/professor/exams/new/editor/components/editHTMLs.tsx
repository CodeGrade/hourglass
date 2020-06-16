import React from 'react';
import {
  Form,
  Button,
  Row,
  Col,
} from 'react-bootstrap';
import {
  WrappedFieldArrayProps,
  FieldIterate,
} from 'redux-form';
import { HTMLVal } from '@student/exams/show/types';

const EditHTMLs: React.FC<WrappedFieldArrayProps<HTMLVal> & {
  renderOptions: FieldIterate<HTMLVal, JSX.Element>;
}> = (props) => {
  const {
    renderOptions,
    fields,
  } = props;
  return (
    <>
      <Form.Label column sm={2}>Answers</Form.Label>
      <Col sm={10}>
        <Row className="p-2">
          <Col className="flex-grow-01">
            <b>Correct?</b>
          </Col>
          <Col><b>Prompt</b></Col>
        </Row>
        {fields.map(renderOptions)}
        <Row className="p-2">
          <Col className="text-center p-0">
            <Button
              variant="dark"
              onClick={(): void => {
                fields.push({
                  type: 'HTML',
                  value: '',
                });
              }}
            >
              Add new option
            </Button>
          </Col>
        </Row>
      </Col>
    </>
  );
};

export default EditHTMLs;
