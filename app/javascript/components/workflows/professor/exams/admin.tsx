import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useResponse as examsShow } from '@hourglass/common/api/professor/exams/show';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import { Collapse, Button, Form } from 'react-bootstrap';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import Icon from '@student/exams/show/components/Icon';
import ExamViewer from '@proctor/registrations/show';
import { RailsExam, ContentsState } from '@student/exams/show/types';
import { Editor as CodeMirrorEditor } from 'codemirror';

const ExamAdmin: React.FC<{}> = () => {
  const { examId } = useParams();
  const res = examsShow(examId);
  switch (res.type) {
    case 'ERROR':
      return (
        <span
          className="text-danger"
        >
          {res.text}
        </span>
      );
    case 'LOADING':
      return <p>Loading...</p>;
    case 'RESULT':
      return (
        <>
          <h1>{res.response.exam.name}</h1>
          <PreviewExam
            railsExam={{
              id: examId,
              name: res.response.exam.name,
              policies: res.response.exam.policies,
            }}
            contents={res.response.contents}
          />
        </>
      );
    default:
      throw new ExhaustiveSwitchError(res);
  }
};

export default ExamAdmin;

interface CodeMirroredElement extends Element {
  CodeMirror: CodeMirrorEditor;
}

const PreviewExam: React.FC<{
  contents: ContentsState;
  railsExam: RailsExam;
}> = (props) => {
  const {
    contents,
    railsExam,
  } = props;
  const { examId } = useParams();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    document.querySelectorAll('.CodeMirror').forEach((cm) => {
      setTimeout(() => (cm as CodeMirroredElement).CodeMirror.refresh());
    });
  }, [open]);
  return (
    <>
      <Form.Group>
        <Link to={`/exams/${examId}/edit`}>
          <Button
            variant="info"
          >
            Edit Exam
          </Button>
        </Link>
      </Form.Group>
      <Form.Group>
        <Link to={`/exams/${examId}/register`}>
          <Button
            variant="info"
          >
            Register Students
          </Button>
        </Link>
      </Form.Group>
      <Button
        variant="outline-primary"
        className="mt-3 d-flex align-items-center justify-content-between"
        as="div"
        onClick={(): void => setOpen((o) => !o)}
      >
        <h2 className="d-inline">Preview Exam</h2>
        {open ? <Icon I={FaChevronUp} /> : <Icon I={FaChevronDown} />}
      </Button>
      <Collapse in={open}>
        <div className="border p-2">
          <ExamViewer
            railsExam={railsExam}
            contents={contents}
          />
        </div>
      </Collapse>
    </>
  );
};
