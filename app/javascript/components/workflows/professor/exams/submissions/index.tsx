import React from 'react';
import { useResponse as useRegsIndex } from '@hourglass/common/api/grader/registrations';
import { useResponse as useRegsShow } from '@hourglass/common/api/grader/registrations/show';
import {
  useParams,
  Switch,
  Route,
  Link,
} from 'react-router-dom';
import ExamViewer from '@hourglass/workflows/proctor/registrations/show';

const ExamSubmissions: React.FC = () => {
  const { examId } = useParams();
  const res = useRegsIndex(examId);
  if (res.type !== 'RESULT') {
    return <p>Loading...</p>;
  }
  if (res.response.length === 0) {
    return <p>No submissions.</p>;
  }
  return (
    <ul>
      {res.response.map((reg) => (
        <li key={reg.id}>
          <Link to={`/exams/${examId}/submissions/${reg.id}`}>
            {reg.user.displayName}
          </Link>
        </li>
      ))}
    </ul>
  );
};

const ExamSubmission: React.FC = () => {
  const { registrationId } = useParams();
  const res = useRegsShow(registrationId);
  if (res.type === 'LOADING') {
    return <p>Loading...</p>;
  }
  if (res.type === 'ERROR') {
    return (
      <>
        <span className="text-danger">
          <p>Error</p>
          <small>{res.text}</small>
        </span>
      </>
    );
  }
  return (
    <>
      <h1>{`Submission by ${res.response.user.displayName}`}</h1>
      <ExamViewer
        railsExam={{
          id: 10,
          name: 'TEST',
          policies: [],
        }}
        contents={res.response.contents}
      />
    </>
  );
};

const Submissions: React.FC = () => (
  <Switch>
    <Route path="/exams/:examId/submissions/:registrationId">
      <ExamSubmission />
    </Route>
    <Route path="/exams/:examId/submissions">
      <ExamSubmissions />
    </Route>
  </Switch>
);

export default Submissions;
