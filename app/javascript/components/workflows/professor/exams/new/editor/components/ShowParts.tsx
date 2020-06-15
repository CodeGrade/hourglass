import React from 'react';
import {
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import { WrappedFieldArrayProps } from 'redux-form';
import { PartInfo } from '@hourglass/workflows/student/exams/show/types';
import Part from '@professor/exams/new/editor/components/Part';

const ShowParts: React.FC<WrappedFieldArrayProps<PartInfo>> = (props) => {
  const {
    fields,
  } = props;
  return (
    <>
      <Row>
        <Col>
          {fields.map((member, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Part key={index} memberName={member} />
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
