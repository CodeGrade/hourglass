import React, { useState } from 'react';
import {
  Row,
  Col,
  Container,
  Form,
  InputGroup,
  Collapse,
  Button,
  Alert,
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
import { FilePickerExam } from '@professor/exams/new/editor/containers/FilePicker';
import { VeryControlledFileViewer } from '@student/exams/show/components/FileViewer';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { createMap, getFilesForRefs } from '@student/exams/show/files';


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
    reference = [],
    files = [],
  } = exam;
  const { name } = railsExam;
  const [open, setOpen] = useState(false);
  const noFiles = reference.length === 0;
  const fmap = createMap(files);
  const filteredFiles = getFilesForRefs(fmap, reference);

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
      <FileUploader />

      <Alert variant="info">
        <h3>Exam-wide information</h3>
        <Instructions />
        <p>Choose files to be shown for the entire exam</p>
        <InputGroup>
          <div className="flex-grow-1">
            <FilePickerExam />
          </div>
          <InputGroup.Append>
            <Button
              variant="info"
              disabled={noFiles}
              onClick={(): void => setOpen((o) => !o)}
            >
              Preview files
              {open && !noFiles ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
            </Button>
          </InputGroup.Append>
        </InputGroup>
        <Collapse in={open && !noFiles}>
          <div className="border">
            <VeryControlledFileViewer files={filteredFiles} />
          </div>
        </Collapse>

      </Alert>
      <ShowQuestions questions={questions} />
    </Container>
  );
};

export default Editor;
