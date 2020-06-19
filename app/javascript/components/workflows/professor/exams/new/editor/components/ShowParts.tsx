import React from 'react';
import {
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import { WrappedFieldArrayProps } from 'redux-form';
import { PartInfo } from '@student/exams/show/types';
import Part from '@professor/exams/new/editor/components/Part';

const ShowParts: React.FC<{
  qnum: number;
} & WrappedFieldArrayProps<PartInfo>> = (props) => {
  const {
    qnum,
    fields,
  } = props;
  return (
    <>
      <Row>
        <Col>
          {fields.map((member, index) => (
            <Part
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              qnum={qnum}
              pnum={index}
              memberName={member}
              enableDown={index + 1 < fields.length}
              moveDown={(): void => {
                fields.move(index, index + 1);
              }}
              moveUp={(): void => {
                fields.move(index, index - 1);
              }}
              remove={(): void => {
                fields.remove(index);
              }}
            />
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
