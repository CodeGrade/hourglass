import React from 'react';
import {
  Form,
  Card,
  Alert,
  Row,
  Col,
} from 'react-bootstrap';
import { MoveQuestionAction } from '@professor/exams/new/types';
import { moveQuestion } from '@professor/exams/new/actions';
import YesNo from '@student/exams/show/components/questions/YesNo';
import MoveItem from '@professor/exams/new/editor/containers/MoveItem';
import ShowParts from '@professor/exams/new/editor/containers/ShowParts';
import { PartInfo } from '@student/exams/show/types';

export interface QuestionProps {
  qnum: number;
  numQuestions: number;
  name: string;
  description: string;
  separateSubparts: boolean;
  parts: PartInfo[];
  onChange: (name: string, description: string, separateSubparts: boolean) => void;
}


const Question: React.FC<QuestionProps> = (props) => {
  const {
    qnum,
    numQuestions,
    name,
    description,
    separateSubparts,
    onChange,
  } = props;
  return (
    <Card border="primary">
      <Alert variant="primary">
        <Card.Title>
          <MoveItem
            enableUp={qnum > 0}
            enableDown={qnum + 1 < numQuestions}
            onUp={(): MoveQuestionAction => moveQuestion(qnum, qnum - 1)}
            onDown={(): MoveQuestionAction => moveQuestion(qnum, qnum + 1)}
          />
          {`Question ${qnum + 1}`}
        </Card.Title>
        <Card.Subtitle>
          <Form.Group as={Row} controlId={`${qnum}-name`}>
            <Form.Label column sm="2">Question name</Form.Label>
            <Col sm="10">
              <Form.Control
                type="input"
                value={name}
                placeholder="Give a short (optional) descriptive name for the question"
                onChange={(e): void => {
                  const elem = e.target;
                  onChange(elem.value, description, separateSubparts);
                }}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId={`${qnum}-desc`}>
            <Form.Label column sm="2">Description:</Form.Label>
            <Col sm="10">
              <Form.Control
                type="input"
                value={description}
                placeholder="Give a longer description of the question"
                onChange={(e): void => {
                  const elem = e.target;
                  onChange(name, elem.value, separateSubparts);
                }}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId={`${qnum}-separate`}>
            <Form.Label column sm="2">Separate subparts?</Form.Label>
            <Col sm="10">
              <YesNo
                value={!!separateSubparts}
                info={{ type: 'YesNo', prompt: '' }}
                onChange={(newVal): void => {
                  onChange(name, description, newVal);
                }}
              />
            </Col>
          </Form.Group>
        </Card.Subtitle>
      </Alert>
      <Card.Body>
        <ShowParts qnum={qnum} />
      </Card.Body>
    </Card>
  );
};

export default Question;
