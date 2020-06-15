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
  const fmap = createMap(files);
  return (
    <Container fluid className="flex-fill">
      <FileUploader />

      <ShowQuestions questions={questions} />

      <div className="my-2 float-right">
        <Submit />
      </div>
    </Container>
  );
};

export default Editor;
