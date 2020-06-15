import React, { useState } from 'react';
import {
  Container,
  InputGroup,
  Collapse,
  Button,
  Alert,
} from 'react-bootstrap';
import { ExamVersion } from '@student/exams/show/types';
import Instructions from '@professor/exams/new/editor/containers/Instructions';
import FileUploader from '@professor/exams/new/editor/containers/FileUploader';
import ShowQuestions from '@professor/exams/new/editor/containers/ShowQuestions';
import { FilePickerExam } from '@professor/exams/new/editor/containers/FilePicker';
import { VeryControlledFileViewer } from '@student/exams/show/components/FileViewer';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { createMap, getFilesForRefs } from '@student/exams/show/files';
import Submit from '@professor/exams/new/editor/containers/Submit';
import { ExamFilesContext } from '@hourglass/workflows/student/exams/show/context';

export interface ExamEditorProps {
  name: string;
  version: ExamVersion;
}

const Editor: React.FC<ExamEditorProps> = (props) => {
  const {
    version: exam,
  } = props;
  const {
    questions,
    reference = [],
    files = [],
  } = exam;
  const [open, setOpen] = useState(false);
  const noFiles = reference.length === 0;
  const fmap = createMap(files);
  const filteredFiles = getFilesForRefs(fmap, reference);
  return (
    <ExamFilesContext.Provider
      value={{
        references: reference,
      }}
    >
      <Container fluid className="flex-fill">
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

        <div className="my-2 float-right">
          <Submit />
        </div>
      </Container>
    </ExamFilesContext.Provider>
  );
};

export default Editor;
