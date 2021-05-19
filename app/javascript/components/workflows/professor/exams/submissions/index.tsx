import React, { useState, useCallback, useContext } from 'react';
import {
  useParams,
  Switch,
  Route,
  Link,
} from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import { graphql } from 'react-relay';
import { BsListCheck } from 'react-icons/bs';
import { useQuery, useMutation } from 'relay-hooks';
import {
  AnswersState,
} from '@student/exams/show/types';
import Spoiler from '@hourglass/common/Spoiler';
import ExamViewer from '@proctor/registrations/show';
import ExamViewerStudent from '@student/registrations/show';
import { FinalizeDialog, finalizeItemMutation } from '@proctor/exams';
import { AlertContext } from '@hourglass/common/alerts';
import { examsFinalizeItemMutation } from '@proctor/exams/__generated__/examsFinalizeItemMutation.graphql';
import Icon from '@student/exams/show/components/Icon';
import { RenderError } from '@hourglass/common/boundary';
import DocumentTitle from '@hourglass/common/documentTitle';
import { CurrentGrading } from '@professor/exams/types';

import { submissionsAllQuery, submissionsAllQueryResponse } from './__generated__/submissionsAllQuery.graphql';
import { submissionsRootQuery } from './__generated__/submissionsRootQuery.graphql';
import { submissionsStaffQuery } from './__generated__/submissionsStaffQuery.graphql';
import { submissionsStudentQuery } from './__generated__/submissionsStudentQuery.graphql';

type Registration = submissionsAllQueryResponse['exam']['registrations'][number];
const ExamSubmissions: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const res = useQuery<submissionsAllQuery>(
    graphql`
    query submissionsAllQuery($examId: ID!) {
      exam(id: $examId) {
        name
        registrations {
          id
          user {
            displayName
          }
          started
          over
          final
        }
      }
    }
    `,
    { examId },
  );
  const [showModal, setShowModal] = useState(false);
  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation<examsFinalizeItemMutation>(
    finalizeItemMutation,
    {
      onCompleted: () => {
        closeModal();
        alert({
          variant: 'success',
          title: 'Finalization successful',
          message: 'Finalized all students\' submissions.',
          autohide: true,
        });
      },
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error finalizing all students',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const finalize = (subjectValue) => {
    mutate({
      variables: {
        input: {
          id: subjectValue,
          scope: 'out_of_time',
        },
      },
    });
  };
  if (res.error) {
    return <RenderError error={res.error} />;
  }
  if (!res.data) {
    return <p>Loading...</p>;
  }
  const {
    registrations,
  } = res.data.exam;
  const groups: {
    notStarted: Registration[],
    started: Registration[],
    over: Registration[],
    final: Registration[],
  } = {
    notStarted: [],
    started: [],
    over: [],
    final: [],
  };
  registrations.forEach((r) => {
    if (r.final) groups.final.push(r);
    else if (r.over) groups.over.push(r);
    else if (r.started) groups.started.push(r);
    else groups.notStarted.push(r);
  });
  const startedButNotFinished = groups.over.length > 0 || groups.started.length > 0;
  return (
    <DocumentTitle title={`${res.data.exam.name} -- All submissions`}>
      <h4>Completed submissions</h4>
      {groups.final.length === 0 ? (
        <i>No completed submissions yet</i>
      ) : (
        <ul>
          {groups.final.map((reg) => (
            <li key={reg.id}>
              <Link to={`/exams/${examId}/submissions/${reg.id}`}>
                {reg.user.displayName}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {startedButNotFinished && (
        <div>
          <FinalizeDialog
            loading={loading}
            buttonText="Finalize all students' submissions who have run out of time"
            subjectName="all students who have run out of time"
            subjectValue={examId}
            showModal={showModal}
            closeModal={closeModal}
            finalize={finalize}
          />
          <Button
            variant="danger"
            onClick={openModal}
          >
            <Icon I={BsListCheck} />
            Finalize
          </Button>
        </div>
      )}
      {groups.over.length === 0 ? (
        null
      ) : (
        <>
          <h4>Out-of-time submissions</h4>
          <ul>
            {groups.over.map((reg) => (
              <li key={reg.id}>
                <Link to={`/exams/${examId}/submissions/${reg.id}`}>
                  {reg.user.displayName}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
      <h4>Started submissions</h4>
      {groups.started.length === 0 ? (
        <i>No one is currently taking the exam</i>
      ) : (
        <ul>
          {groups.started.map((reg) => (
            <li key={reg.id}>
              <Link to={`/exams/${examId}/submissions/${reg.id}`}>
                {reg.user.displayName}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <h4>Not-yet-started submissions</h4>
      {groups.notStarted.length === 0 ? (
        <i>Everyone has started</i>
      ) : (
        <ul>
          {groups.notStarted.map((reg) => (
            <li key={reg.id}>
              <Link to={`/exams/${examId}/submissions/${reg.id}`}>
                {reg.user.displayName}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DocumentTitle>
  );
};

const ExamSubmission: React.FC = () => {
  const { registrationId } = useParams<{ registrationId: string }>();
  const res = useQuery<submissionsRootQuery>(
    graphql`
    query submissionsRootQuery($registrationId: ID!) {
      me {
        id
      }
      registration(id: $registrationId) {
        published
        exam { name }
        user {
          id
          displayName
        }
      }
    }
    `,
    { registrationId },
  );
  if (res.error) {
    return <RenderError error={res.error} />;
  }
  if (!res.data) {
    return <p>Loading...</p>;
  }
  const myRegistration = res.data.me.id === res.data.registration.user.id;
  // TODO: better error message if the request fails because it is someone else's registration
  if (myRegistration) {
    if (!res.data.registration.published) {
      const title = `${res.data.registration.exam.name} -- Submission for ${res.data.registration.user.displayName}`;
      return (
        <DocumentTitle title={title}>
          <h1>{`Submission for ${res.data.registration.exam.name}`}</h1>
          <p>Your submission is not yet graded, and cannot be viewed at this time.</p>
        </DocumentTitle>
      );
    }
    return (
      <ExamSubmissionStudent />
    );
  }
  return (
    <ExamSubmissionStaff />
  );
};

function round(value: number, places: number): number {
  const multiplier = 10 ** places;
  return Math.round(value * multiplier) / multiplier;
}

const ExamSubmissionStudent: React.FC = () => {
  const { registrationId } = useParams<{ registrationId: string }>();
  const res = useQuery<submissionsStudentQuery>(
    graphql`
    query submissionsStudentQuery($registrationId: ID!) {
      registration(id: $registrationId) {
        currentAnswers
        currentGrading
        currentScorePercentage
        user {
          nuid
          displayName
        }
        exam { name }
        examVersion {
          ...showExamViewerStudent
        }
      }
    }
    `,
    { registrationId },
  );
  if (res.error) {
    return <RenderError error={res.error} />;
  }
  if (!res.data) {
    return <p>Loading...</p>;
  }
  const { registration } = res.data;
  const {
    exam,
    user,
    currentAnswers,
    currentGrading,
    currentScorePercentage,
  } = registration;
  const title = `${exam.name} -- Submission for ${user.displayName}`;
  const userInfo = `${user.displayName} (${user.nuid})`;
  return (
    <DocumentTitle title={title}>
      <h1>
        {`Submission by ${userInfo}`}
      </h1>
      <h2>{`Grade: ${round(currentScorePercentage, 2).toFixed(2)}%`}</h2>
      <ExamViewerStudent
        version={registration.examVersion}
        currentGrading={currentGrading as CurrentGrading}
        currentAnswers={currentAnswers as AnswersState}
        overviewMode={false}
      />
    </DocumentTitle>
  );
};

const ExamSubmissionStaff: React.FC = () => {
  const { registrationId } = useParams<{ registrationId: string }>();
  const res = useQuery<submissionsStaffQuery>(
    graphql`
    query submissionsStaffQuery($registrationId: ID!) {
      registration(id: $registrationId) {
        currentAnswers
        currentGrading
        published
        user {
          nuid
          displayName
        }
        exam { name }
        examVersion {
          ...showExamViewer
        }
      }
    }
    `,
    { registrationId },
  );
  const [title, setTitle] = useState<string>(undefined);
  if (res.error) {
    return <RenderError error={res.error} />;
  }
  if (!res.data) {
    return <p>Loading...</p>;
  }
  const { registration } = res.data;
  const {
    currentAnswers,
    currentGrading,
    published,
    user,
    exam,
  } = registration;
  const userInfo = `${user.displayName} (${user.nuid})`;
  const titleInfo = published ? userInfo : '<redacted>';
  if (title === undefined) setTitle(`${exam.name} -- Submission for ${titleInfo}`);
  if (currentAnswers === null && !published) {
    return (
      <DocumentTitle title={`${exam.name} -- Submission for ${user.displayName}`}>
        <h1>{`Submission for ${exam.name}`}</h1>
        <p>Your submission is not yet graded, and cannot be viewed at this time.</p>
      </DocumentTitle>
    );
  }
  return (
    <DocumentTitle title={title}>
      <h1>
        {'Submission by '}
        {(published ? userInfo : (
          <Spoiler
            text={userInfo}
            onToggle={(newOpen) => {
              setTitle(`${exam.name} -- Submission for ${newOpen ? userInfo : '<redacted>'}`);
            }}
          />
        ))}
      </h1>
      <ExamViewer
        version={registration.examVersion}
        currentGrading={currentGrading as CurrentGrading}
        currentAnswers={currentAnswers as AnswersState}
        registrationId={registrationId}
        overviewMode={false}
      />
    </DocumentTitle>
  );
};

const Submissions: React.FC = () => (
  <Container>
    <Switch>
      <Route path="/exams/:examId/submissions/:registrationId">
        <ExamSubmission />
      </Route>
      <Route path="/exams/:examId/submissions">
        <ExamSubmissions />
      </Route>
    </Switch>
  </Container>
);

export default Submissions;
