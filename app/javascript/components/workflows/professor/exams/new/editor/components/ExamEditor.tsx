import React from 'react';
import {
  Row,
  Col,
  Container,
  Form,
} from 'react-bootstrap';
import {
  Exam,
  RailsExam,
  AnswersState,
} from '@student/exams/show/types';
import Instructions from '@professor/exams/new/editor/containers/Instructions';
import FileUploader from '@professor/exams/new/editor/containers/FileUploader';
import Policies from '@professor/exams/new/editor/containers/Policies';
import ShowQuestions from '@professor/exams/new/editor/containers/ShowQuestions';

export interface ExamEditorProps {
  exam: Exam;
  railsExam: RailsExam;
  answers: AnswersState;
  onChange: (newTitle: string) => void;
}

const Editor: React.FC<ExamEditorProps> = (props) => {
  const {
    exam,
    railsExam,
    onChange,
  } = props;
  const {
    questions,
  } = exam;
  const { name } = railsExam;
  return (
    <Container fluid className="flex-fill">
      <Form>
        <Form.Group as={Row} controlId="examTitle">
          <Form.Label column sm="3"><h2>Exam name:</h2></Form.Label>
          <Col>
            <Form.Control
              size="lg"
              type="text"
              placeholder="Enter an exam name"
              value={name}
              onChange={(e): void => onChange(e.target.value)}
            />
          </Col>
        </Form.Group>
        <Policies />
      </Form>

      <Instructions />
      <FileUploader />
      <ShowQuestions questions={questions} />
    </Container>
  );
};

export default Editor;
