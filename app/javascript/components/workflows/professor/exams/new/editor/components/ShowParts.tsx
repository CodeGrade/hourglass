import React from 'react';
import Part from '@professor/exams/new/editor/containers/Part';
import {
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import { PartInfo } from '@student/exams/show/types';

export interface PartsProps {
  qnum: number;
  numParts: number;
  addPart: (pnum: number, part: PartInfo) => void;
}

const ShowParts: React.FC<PartsProps> = (props) => {
  const {
    qnum,
    numParts,
    addPart,
  } = props;
  return (
    <>
      {Array.from(Array(numParts).keys()).map((_, pnum) => (
      // eslint-disable-next-line react/no-array-index-key
        <Part key={pnum} qnum={qnum} pnum={pnum} numParts={numParts} />
      ))}
      <Row className="text-center">
        <Col>
          <Button
            variant="success"
            onClick={(): void => {
              addPart(numParts, {
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
              });
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
