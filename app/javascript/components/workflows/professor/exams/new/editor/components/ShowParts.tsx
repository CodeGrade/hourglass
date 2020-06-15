import React from 'react';
import {
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import { WrappedFieldArrayProps } from 'redux-form';
import { PartInfo } from '@hourglass/workflows/student/exams/show/types';
import Part from '@professor/exams/new/editor/containers/Part';

const ShowParts: React.FC<WrappedFieldArrayProps<PartInfo>> = (props) => {
  const {
    fields,
  } = props;
  return (
    <>
      <Row>
        <Col>
          {fields.map((member, index) => (
            <p key={index}>TODO: {member}</p>
          ))}
        </Col>
      </Row>
      <Row className="text-center">
        <Col>
          <Button
            variant="success"
            onClick={(): void => {
              const p: PartInfo = {
                reference: [],
                name: {
                  type: 'HTML',
                  value: '',
                },
                description: {
                  type: 'HTML',
                  value: '',
                },
                points: 0,
                body: [],
              };
              fields.push(p);
            }}
          >
            Add part
          </Button>
        </Col>
      </Row>
    </>

  );
};

export default ShowParts;
