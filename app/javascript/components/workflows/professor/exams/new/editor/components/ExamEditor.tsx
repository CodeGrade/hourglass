import React from 'react';
import {
  Container,
} from 'react-bootstrap';
import { ExamVersion } from '@student/exams/show/types';
import ShowQuestions from '@professor/exams/new/editor/containers/ShowQuestions';
import Submit from '@professor/exams/new/editor/containers/Submit';

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
  } = exam;
  return (
    <Container fluid className="flex-fill">
      <ShowQuestions questions={questions} />
      <div className="my-2 float-right">
        <Submit />
      </div>
    </Container>
  );
};

export default Editor;
