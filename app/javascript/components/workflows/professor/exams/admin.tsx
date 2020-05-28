import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useResponse as examsShow } from '@hourglass/common/api/professor/exams/show';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import { Collapse, Button } from 'react-bootstrap';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import Icon from '@hourglass/workflows/student/exams/show/components/Icon';
import ExamViewer from '@hourglass/workflows/proctor/registrations/show';

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
          <h2>{res.response.exam.name}</h2>
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
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="outline-primary"
        className="d-flex align-items-center justify-content-between"
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

const ExamAnswers: React.FC<{}> = () => {
  return (
    <p>answers here!</p>
  );
};
