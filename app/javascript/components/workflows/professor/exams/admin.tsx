import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useResponse as examsShow } from '@hourglass/common/api/professor/exams/show';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import { Collapse, Button } from 'react-bootstrap';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import Icon from '@hourglass/workflows/student/exams/show/components/Icon';
import ExamViewer from '@hourglass/workflows/proctor/registrations/show';
import { RailsExam, ContentsState } from '@hourglass/workflows/student/exams/show/types';

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
    document.querySelectorAll('.CodeMirror').forEach((cm: any) => {
      setTimeout(() => cm.CodeMirror.refresh());
    });
  }, [open]);
  return (
    <>
      <Link to={`/exams/${examId}/edit`}>
        <Button
          variant="info"
        >
          Edit Exam
        </Button>
      </Link>
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
