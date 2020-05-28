import React, { useState } from 'react';
import {
  Form,
  Card,
  Alert,
  Row,
  Col,
} from 'react-bootstrap';
import CustomEditor from '@professor/exams/new/editor/components/CustomEditor';
import { HTMLVal } from '@student/exams/show/types';
import MoveItem from '@professor/exams/new/editor/containers/MoveItem';
import ShowBodyItems from '@professor/exams/new/editor/containers/ShowBodyItems';
import { MovePartAction, DeletePartAction } from '../../types';
import { movePart, deletePart } from '../../actions';


export interface PartProps {
  qnum: number;
  pnum: number;
  numParts: number;
  name: HTMLVal;
  description: HTMLVal;
  points: number;
  onChange: (name: HTMLVal, description: HTMLVal, points: number) => void;
}

const Part: React.FC<PartProps> = (props) => {
  const {
    qnum,
    pnum,
    numParts,
    name,
    description,
    points,
    onChange,
  } = props;
  const [moversVisible, setMoversVisible] = useState(false);
  return (
    <Card
      className="mb-3"
      border="success"
      onMouseOver={(): void => setMoversVisible(true)}
      onFocus={(): void => setMoversVisible(true)}
      onBlur={(): void => setMoversVisible(false)}
      onMouseOut={(): void => setMoversVisible(false)}
    >
      <MoveItem
        visible={moversVisible}
        variant="success"
        enableUp={pnum > 0}
        enableDown={pnum + 1 < numParts}
        onUp={(): MovePartAction => movePart(qnum, pnum, pnum - 1)}
        onDown={(): MovePartAction => movePart(qnum, pnum, pnum + 1)}
        onDelete={(): DeletePartAction => deletePart(qnum, pnum)}
      />
      <Alert variant="success">
        <Card.Title>
          {`Part ${String.fromCharCode(65 + pnum)}`}
        </Card.Title>
        <Card.Subtitle>
          <Form.Group as={Row} controlId={`${qnum}-${pnum}-name`}>
            <Form.Label column sm="2">Part name</Form.Label>
            <Col sm="10">
              <CustomEditor
                className="bg-white"
                value={name}
                placeholder="Give a short (optional) descriptive name for the part"
                onChange={(newName, _delta, source, _editor): void => {
                  if (source === 'user') onChange(newName, description, points);
                }}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId={`${qnum}-${pnum}-desc`}>
            <Form.Label column sm="2">Description:</Form.Label>
            <Col sm="10">
              <CustomEditor
                className="bg-white"
                value={description}
                placeholder="Give a longer description of the question"
                onChange={(newDesc, _delta, source, _editor): void => {
                  if (source === 'user') onChange(name, newDesc, points);
                }}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId={`${qnum}-${pnum}-points`}>
            <Form.Label column sm="2">Points</Form.Label>
            <Col sm="10">
              <Form.Control
                type="number"
                value={points}
                placeholder="Points for this part"
                min={0}
                max={100}
                step={0.5}
                onChange={(e): void => {
                  if (e.target.value === '') {
                    onChange(name, description, 0);
                  } else {
                    const newVal = Number.parseFloat(e.target.value);
                    const actual = (Number.isFinite(newVal) ? newVal : points);
                    onChange(name, description, actual);
                  }
                }}
              />
              {/* <NumberPicker
                placeholder="Points for this part"
                value={points}
                onChange={(newVal): void => onChange(name, description, newVal)}
                min={0}
                max={100}
                step={0.5}
                format="#.#"
              /> */}
            </Col>
          </Form.Group>
        </Card.Subtitle>
      </Alert>
      <Card.Body>
        <ShowBodyItems qnum={qnum} pnum={pnum} />
      </Card.Body>
    </Card>
  );
};

export default Part;
