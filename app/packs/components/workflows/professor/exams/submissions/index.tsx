import React, {
  useState,
  useCallback,
  useContext,
  Suspense,
  useEffect,
  useMemo,
} from 'react';
import {
  useParams,
  Switch,
  Route,
  Link,
  Redirect,
  useLocation,
} from 'react-router-dom';
import { DateTime, LocaleOptions } from 'luxon';
import { Container, Button, Table } from 'react-bootstrap';
import { BsListCheck } from 'react-icons/bs';
import {
  graphql,
  useLazyLoadQuery,
  useMutation,
  useSubscription,
} from 'react-relay';
import {
  AnswersState,
} from '@student/exams/show/types';
import Spoiler from '@hourglass/common/Spoiler';
import ExamViewer from '@proctor/registrations/show';
import ExamTimelineViewer, { SnapshotsState } from '@proctor/registrations/show/Timeline';
import ExamViewerStudent from '@student/registrations/show';
import { FinalizeDialog, finalizeItemMutation } from '@proctor/exams';
import { AlertContext } from '@hourglass/common/alerts';
import { scrollToElem } from '@student/exams/show/helpers';
import { examsFinalizeItemMutation } from '@proctor/exams/__generated__/examsFinalizeItemMutation.graphql';
import Icon from '@student/exams/show/components/Icon';
import ErrorBoundary from '@hourglass/common/boundary';
import DocumentTitle from '@hourglass/common/documentTitle';
import { CurrentGrading } from '@professor/exams/types';
import { describeRemainingTime } from '@student/exams/show/components/navbar/TimeRemaining';

import { submissionsAllQuery, submissionsAllQuery$data } from './__generated__/submissionsAllQuery.graphql';
import { submissionsRootQuery } from './__generated__/submissionsRootQuery.graphql';
import { submissionsAuditRootQuery } from './__generated__/submissionsAuditRootQuery.graphql';
import { submissionsStaffQuery } from './__generated__/submissionsStaffQuery.graphql';
import { submissionsAuditStaffQuery } from './__generated__/submissionsAuditStaffQuery.graphql';
import { submissionsStudentQuery } from './__generated__/submissionsStudentQuery.graphql';

type Registration = submissionsAllQuery$data['exam']['registrations'][number];

const ExamSubmissions: React.FC = () => (
  <ErrorBoundary>
    <Suspense
      fallback={(
        <p>Loading...</p>
      )}
    >
      <ExamSubmissionsQuery />
    </Suspense>
  </ErrorBoundary>
);

const registrationWasUpdatedSubscriptionSpec = graphql`
  subscription submissionsRegistrationWasUpdatedSubscription($examId: ID!) {
    registrationWasUpdated(examId: $examId) {
      registration {
        id
        currentPin
        pinValidated
        started
        over
        final
      }
    }
  }
`;

const ExamSubmissionsQuery: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const queryData = useLazyLoadQuery<submissionsAllQuery>(
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
          startTime
          endTime
          effectiveEndTime
          currentPin
          pinValidated
        }
      }
    }
    `,
    { examId },
  );
  useSubscription(useMemo(() => ({
    subscription: registrationWasUpdatedSubscriptionSpec,
    variables: {
      examId,
    },
  }), [examId]));
  const [showModal, setShowModal] = useState(false);
  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);
  const { alert } = useContext(AlertContext);
  const [mutate, loading] = useMutation<examsFinalizeItemMutation>(
    finalizeItemMutation,
  );
  const finalize = (subjectValue) => {
    mutate({
      variables: {
        input: {
          id: subjectValue,
          scope: 'out_of_time',
        },
      },
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
    });
  };
  const {
    registrations,
  } = queryData.exam;
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
  const anyPins = registrations.some((r) => (r.currentPin ?? '') !== '');
  const startedButNotFinished = groups.over.length > 0 || groups.started.length > 0;
  const timeOpts : LocaleOptions & Intl.DateTimeFormatOptions = {
    weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  };
  const lastStudentFinishTime = groups.started.reduce((latestSoFar, cur) => {
    const currentDateTime = DateTime.fromISO(cur.effectiveEndTime);
    if (currentDateTime > latestSoFar) {
      return currentDateTime;
    }
    return latestSoFar;
  }, DateTime.fromMillis(0));
  return (
    <DocumentTitle title={`${queryData.exam.name} -- All submissions`}>
      <h4>{`Completed submissions (${groups.final.length})`}</h4>
      {groups.final.length === 0 ? (
        <i>No completed submissions yet</i>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Started</th>
              <th>Ended</th>
            </tr>
          </thead>
          <tbody>
            {groups.final.map((reg) => (
              <tr key={reg.id}>
                <td>
                  <Link to={`/exams/${examId}/submissions/${reg.id}`}>
                    {reg.user.displayName}
                  </Link>
                </td>
                <td>{reg.startTime && DateTime.fromISO(reg.startTime).toLocaleString(timeOpts)}</td>
                <td>{reg.endTime && DateTime.fromISO(reg.endTime).toLocaleString(timeOpts)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      {groups.over.length === 0 ? (
        null
      ) : (
        <>
          <h4>
            Out-of-time submissions
            {startedButNotFinished && (
              <div className="d-inline-block ml-4">
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
          </h4>
          <Table hover>
            <thead>
              <tr>
                <th>Student</th>
                <th>Started</th>
                <th>Ended</th>
              </tr>
            </thead>
            <tbody>
              {groups.over.map((reg) => (
                <tr key={reg.id}>
                  <td>
                    <Link to={`/exams/${examId}/submissions/${reg.id}`}>
                      {reg.user.displayName}
                    </Link>
                  </td>
                  <td>
                    {reg.startTime && DateTime.fromISO(reg.startTime).toLocaleString(timeOpts)}
                  </td>
                  <td>
                    {reg.endTime && DateTime.fromISO(reg.endTime).toLocaleString(timeOpts)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
      <h4>{`Started submissions (${groups.started.length})`}</h4>
      {groups.started.length > 0 && (
        <h5>{`Last student must finish by: ${lastStudentFinishTime.toLocaleString(timeOpts)}`}</h5>
      )}
      {groups.started.length === 0 ? (
        <i>No one is currently taking the exam</i>
      ) : (
        <Table hover>
          <thead>
            <tr>
              <th>Student</th>
              <th>Started</th>
              <th>Ended</th>
              <th>End by</th>
              <th>Time Remaining</th>
            </tr>
          </thead>
          <tbody>
            {groups.started.map((reg) => {
              const timeDiff = DateTime.fromISO(reg.effectiveEndTime).diff(DateTime.local());
              return (
                <tr key={reg.id}>
                  <td>
                    <Link to={`/exams/${examId}/submissions/${reg.id}`}>
                      {reg.user.displayName}
                    </Link>
                  </td>
                  <td>
                    {reg.startTime && DateTime.fromISO(reg.startTime).toLocaleString(timeOpts)}
                  </td>
                  <td>
                    {reg.endTime && DateTime.fromISO(reg.endTime).toLocaleString(timeOpts)}
                  </td>
                  <td>
                    {reg.effectiveEndTime && (
                      DateTime.fromISO(reg.effectiveEndTime).toLocaleString(timeOpts)
                    )}
                  </td>
                  <td>
                    {describeRemainingTime(timeDiff)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
      <h4>{`Not-yet-started submissions (${groups.notStarted.length})`}</h4>
      {groups.notStarted.length === 0 ? (
        <i>Everyone has started</i>
      ) : (
        <Table hover>
          <thead>
            <tr>
              <th>Student</th>
              {anyPins && (<th>Current PIN</th>)}
            </tr>
          </thead>
          <tbody>
            {groups.notStarted.map((reg) => (
              <tr key={reg.id}>
                <td>
                  <Link to={`/exams/${examId}/submissions/${reg.id}`}>
                    {reg.user.displayName}
                  </Link>
                </td>
                {anyPins && (
                  <td>
                    {reg.pinValidated
                      ? 'Already validated'
                      : (reg.currentPin ?? 'none required')}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </DocumentTitle>
  );
};

const ExamSubmission: React.FC = () => (
  <ErrorBoundary>
    <Suspense
      fallback={
        <p>Loading...</p>
      }
    >
      <ExamSubmissionQuery />
    </Suspense>
  </ErrorBoundary>
);

const ExamSubmissionQuery: React.FC = () => {
  const { registrationId } = useParams<{ registrationId: string }>();
  const queryData = useLazyLoadQuery<submissionsRootQuery>(
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
  const myRegistration = queryData.me.id === queryData.registration.user.id;
  // TODO: better error message if the request fails because it is someone else's registration
  if (myRegistration) {
    if (!queryData.registration.published) {
      const title = `${queryData.registration.exam.name} -- Submission for ${queryData.registration.user.displayName}`;
      return (
        <DocumentTitle title={title}>
          <h1>{`Submission for ${queryData.registration.exam.name}`}</h1>
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

const ExamSubmissionAudit: React.FC = () => (
  <ErrorBoundary>
    <Suspense
      fallback={<p>Loading...</p>}
    >
      <ExamSubmissionAuditQuery />
    </Suspense>
  </ErrorBoundary>
);

const ExamSubmissionAuditQuery: React.FC = () => {
  const { examId, registrationId } = useParams<{ examId: string, registrationId: string }>();
  const res = useLazyLoadQuery<submissionsAuditRootQuery>(
    graphql`
    query submissionsAuditRootQuery($registrationId: ID!) {
      me {
        id
      }
      registration(id: $registrationId) {
        published
        exam { 
          id
          name
        }
        user {
          id
          displayName
        }
      }
    }
    `,
    { registrationId },
  );
  const myRegistration = res.me.id === res.registration.user.id;
  if (myRegistration) {
    return (
      <Redirect to={`/exams/${examId}/submissions/${registrationId}`} />
    );
  }
  return (
    <ExamSubmissionAuditStaff />
  );
};

function round(value: number, places: number): number {
  const multiplier = 10 ** places;
  return Math.round(value * multiplier) / multiplier;
}

const ExamSubmissionStudent: React.FC = () => (
  <ErrorBoundary>
    <Suspense
      fallback={
        <p>Loading...</p>
      }
    >
      <ExamSubmissionStudentQuery />
    </Suspense>
  </ErrorBoundary>
);

const ExamSubmissionStudentQuery: React.FC = () => {
  const { registrationId } = useParams<{ registrationId: string }>();
  const queryData = useLazyLoadQuery<submissionsStudentQuery>(
    graphql`
    query submissionsStudentQuery($registrationId: ID!, $withRubric: Boolean!) {
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
    { registrationId, withRubric: false },
  );
  const { registration } = queryData;
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

const ExamSubmissionStaff: React.FC = () => (
  <ErrorBoundary>
    <Suspense
      fallback={<p>Loading...</p>}
    >
      <ExamSubmissionStaffQuery />
    </Suspense>
  </ErrorBoundary>
);

const ExamSubmissionStaffQuery: React.FC = () => {
  const { registrationId } = useParams<{ registrationId: string }>();
  const { hash } = useLocation();
  useEffect(() => {
    setTimeout(() => scrollToElem(hash.substring(1)));
  }, [hash]);
  const queryData = useLazyLoadQuery<submissionsStaffQuery>(
    graphql`
    query submissionsStaffQuery($registrationId: ID!, $withRubric: Boolean!) {
      registration(id: $registrationId) {
        currentAnswers
        currentGrading
        currentScorePercentage
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
    { registrationId, withRubric: true },
  );
  const [title, setTitle] = useState<string>(undefined);
  const { registration } = queryData;
  const {
    currentAnswers,
    currentGrading,
    currentScorePercentage,
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
      {published && (
        <h2>{`Grade: ${round(currentScorePercentage, 2).toFixed(2)}%`}</h2>
      )}
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

const ExamSubmissionAuditStaff: React.FC = () => (
  <ErrorBoundary>
    <Suspense
      fallback={<p>Loading...</p>}
    >
      <ExamSubmissionAuditStaffQuery />
    </Suspense>
  </ErrorBoundary>
);

const ExamSubmissionAuditStaffQuery: React.FC = () => {
  const { registrationId } = useParams<{ registrationId: string }>();
  const res = useLazyLoadQuery<submissionsAuditStaffQuery>(
    graphql`
    query submissionsAuditStaffQuery($registrationId: ID!, $withRubric: Boolean!) {
      registration(id: $registrationId) {
        snapshots {
          createdAt
          answers
        }
        startTime
        endTime
        published
        user {
          nuid
          displayName
        }
        exam { name }
        examVersion {
          ...TimelineExamViewer
        }
      }
    }
    `,
    { registrationId, withRubric: false },
  );
  const [title, setTitle] = useState<string>(undefined);
  const { registration } = res;
  const {
    snapshots,
    published,
    startTime,
    endTime,
    user,
    exam,
  } = registration;
  const userInfo = `${user.displayName} (${user.nuid})`;
  const titleInfo = published ? userInfo : '<redacted>';
  if (title === undefined) setTitle(`${exam.name} -- Submission for ${titleInfo}`);
  if (snapshots === null && !published) {
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
      <ExamTimelineViewer
        version={registration.examVersion}
        snapshots={snapshots as SnapshotsState}
        startTime={DateTime.fromISO(startTime)}
        endTime={DateTime.fromISO(endTime)}
        registrationId={registrationId}
      />
    </DocumentTitle>
  );
};

const Submissions: React.FC = () => (
  <Container>
    <Switch>
      <Route path="/exams/:examId/submissions/:registrationId/timeline">
        <ExamSubmissionAudit />
      </Route>
      <Route path="/exams/:examId/submissions/:registrationId" exact>
        <ExamSubmission />
      </Route>
      <Route path="/exams/:examId/submissions">
        <ExamSubmissions />
      </Route>
    </Switch>
  </Container>
);

export default Submissions;
