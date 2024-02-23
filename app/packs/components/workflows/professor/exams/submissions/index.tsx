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
import {
  Container,
  Button,
  Table,
  DropdownButton,
  Dropdown,
  Modal,
} from 'react-bootstrap';
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
import { NavbarBreadcrumbs, NavbarItem } from '@hourglass/common/navbar';
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
import { submissionsExportStudentAnswersQuery } from './__generated__/submissionsExportStudentAnswersQuery.graphql';
import { submissionsExportStudentSnapshotsQuery } from './__generated__/submissionsExportStudentSnapshotsQuery.graphql';
import { submissionsRoleQuery } from './__generated__/submissionsRoleQuery.graphql';

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

const RenderStudentTable: React.FC<{
  students: readonly Registration[],
  examId: string,
  timeOpts: LocaleOptions & Intl.DateTimeFormatOptions,
  actions?: {
    export?: (id: string, name: string) => void
    exportAll?: (id: string, name: string) => void;
  }
}> = (props) => {
  const {
    students,
    examId,
    timeOpts,
    actions,
  } = props;
  return (
    <Table hover>
      <thead>
        <tr>
          <th>Student</th>
          <th>Started</th>
          <th>Ended</th>
          {actions && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {students.map((reg) => (
          <tr key={reg.id}>
            <td>
              <Link to={`/exams/${examId}/submissions/${reg.id}`}>
                {reg.user.displayName}
              </Link>
            </td>
            <td>{reg.startTime && DateTime.fromISO(reg.startTime).toLocaleString(timeOpts)}</td>
            <td>{reg.endTime && DateTime.fromISO(reg.endTime).toLocaleString(timeOpts)}</td>
            {actions && (
              <td>
                <DropdownButton size="sm" className="d-inline-block" variant="primary" title="Actions">
                  {actions.export && (
                    <Dropdown.Item onClick={() => actions.export(reg.id, reg.user.displayName)}>
                      Export current answers
                    </Dropdown.Item>
                  )}
                  {actions.exportAll && (
                    <Dropdown.Item onClick={() => actions.exportAll(reg.id, reg.user.displayName)}>
                      Export all snapshots
                    </Dropdown.Item>
                  )}
                </DropdownButton>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

const ExportStudentAnswersQuery: React.FC<{
  regId: string,
  confirm: (data: string) => void,
  cancel: () => void,
}> = (props) => {
  const {
    regId,
    confirm,
    cancel,
  } = props;
  const queryData = useLazyLoadQuery<submissionsExportStudentAnswersQuery>(
    graphql`
      query submissionsExportStudentAnswersQuery($regId: ID!) {
        registration(id: $regId) {
          id
          currentAnswers
        }
      }
    `,
    { regId },
  );
  return (
    <ExportStudent
      data={queryData.registration.currentAnswers}
      confirm={confirm}
      cancel={cancel}
    />
  );
};

const ExportStudentSnapshotsQuery: React.FC<{
  regId: string,
  confirm: (data: string) => void,
  cancel: () => void,
}> = (props) => {
  const {
    regId,
    confirm,
    cancel,
  } = props;
  const queryData = useLazyLoadQuery<submissionsExportStudentSnapshotsQuery>(
    graphql`
      query submissionsExportStudentSnapshotsQuery($regId: ID!) {
        registration(id: $regId) {
          id
          snapshots {
            answers
            createdAt
          }
        }
      }
    `,
    { regId },
  );
  return (
    <ExportStudent
      data={queryData.registration.snapshots}
      confirm={confirm}
      cancel={cancel}
    />
  );
};

const ExportStudent: React.FC<{
  data: unknown,
  confirm: (data: string) => void,
  cancel: () => void,
}> = (props) => {
  const {
    data,
    confirm,
    cancel,
  } = props;
  const dataText = JSON.stringify(data, null, 2);
  return (
    <>
      <Modal.Body>
        <pre>
          {dataText}
        </pre>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="outline-primary"
          onClick={cancel}
        >
          Close
        </Button>
        <Button
          variant="primary"
          onClick={() => confirm(dataText)}
        >
          Export
        </Button>
      </Modal.Footer>
    </>
  );
};

const ExamSubmissionsQuery: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const queryData = useLazyLoadQuery<submissionsAllQuery>(
    graphql`
    query submissionsAllQuery($examId: ID!) {
      exam(id: $examId) {
        name
        course { id title }
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
  const now = DateTime.local();
  const inPast = (t : string) => (DateTime.fromISO(t) < now);
  registrations.forEach((r) => {
    if (r.final) groups.final.push(r);
    else if (r.over || inPast(r.effectiveEndTime)) groups.over.push(r);
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
  const [showExportAnswers, setShowExportAnswers] = useState(false);
  const [showExportSnapshots, setShowExportSnapshots] = useState(false);
  const [curReg/* , setCurReg */] = useState<string>(undefined);
  const [curName/* , setCurName */] = useState<string>(undefined);
  const items: NavbarItem[] = useMemo(() => [
    [`/courses/${queryData.exam.course.id}`, queryData.exam.course.title],
    [`/exams/${examId}/admin`, queryData.exam.name],
    [undefined, 'Submissions'],
  ], [queryData.exam.course.id, queryData.exam.course.title]);
  return (
    <DocumentTitle title={`${queryData.exam.name} -- All submissions`}>
      <NavbarBreadcrumbs items={items} />
      <h4>
        {`Completed submissions (${groups.final.length})`}
      </h4>
      {groups.final.length === 0 ? (
        <i>No completed submissions yet</i>
      ) : (
        <RenderStudentTable
          students={groups.final}
          examId={examId}
          timeOpts={timeOpts}
          // actions={{
          //   export: (id, name) => {
          //     setCurReg(id);
          //     setCurName(name);
          //     setShowExportAnswers(true);
          //   },
          //   exportAll: (id, name) => {
          //     setCurReg(id);
          //     setCurName(name);
          //     setShowExportSnapshots(true);
          //   },
          // }}
        />
      )}
      <Modal
        show={showExportAnswers}
        centered
        keyboard
        scrollable
        onHide={() => setShowExportAnswers(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {`Export data for ${curName}`}
          </Modal.Title>
        </Modal.Header>
        <ErrorBoundary>
          <Suspense fallback={<p>Loading...</p>}>
            <ExportStudentAnswersQuery
              regId={curReg}
              cancel={() => setShowExportAnswers(false)}
              confirm={(data: string) => navigator.clipboard.writeText(data)}
            />
          </Suspense>
        </ErrorBoundary>
      </Modal>
      <Modal
        show={showExportSnapshots}
        centered
        keyboard
        scrollable
        onHide={() => setShowExportSnapshots(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {`Export data for ${curName}`}
          </Modal.Title>
        </Modal.Header>
        <ErrorBoundary>
          <Suspense fallback={<p>Loading...</p>}>
            <ExportStudentSnapshotsQuery
              regId={curReg}
              cancel={() => setShowExportSnapshots(false)}
              confirm={(data: string) => navigator.clipboard.writeText(data)}
            />
          </Suspense>
        </ErrorBoundary>
      </Modal>
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
          <RenderStudentTable
            students={groups.over}
            examId={examId}
            timeOpts={timeOpts}
          />
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
            {groups.notStarted.map((reg) => {
              let row: React.ReactElement;
              if (reg?.pinValidated) {
                row = <td>Already validated</td>;
              } else if (reg?.currentPin) {
                row = <td style={{ fontFamily: 'monospace' }}>{reg.currentPin}</td>;
              } else {
                row = <td>none required</td>;
              }
              return (
                <tr key={reg.id}>
                  <td>
                    <Link to={`/exams/${examId}/submissions/${reg.id}`}>
                      {reg.user.displayName}
                    </Link>
                  </td>
                  {anyPins && row}
                </tr>
              );
            })}
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
  const { registrationId, examId } = useParams<{ registrationId: string, examId: string }>();
  const role = useLazyLoadQuery<submissionsRoleQuery>(
    graphql`
    query submissionsRoleQuery($examId: ID!) {
      me { id role(examId: $examId) }
    }`,
    { examId },
  );
  const queryData = useLazyLoadQuery<submissionsRootQuery>(
    graphql`
    query submissionsRootQuery($registrationId: ID!, $skipCourse: Boolean!) {
      registration(id: $registrationId) {
        published
        exam { 
          name 
          id
          course @skip(if: $skipCourse) { id title }
        }
        user {
          id
          displayName
        }
      }
    }
    `,
    { registrationId, skipCourse: role.me.role !== 'PROFESSOR' },
  );
  const myRegistration = role.me.id === queryData.registration.user.id;
  // TODO: better error message if the request fails because it is someone else's registration
  if (myRegistration) {
    const items: NavbarItem[] = useMemo(() => [
      [undefined, queryData.registration.exam.name],
    ], [queryData.registration.exam.name]);
    if (!queryData.registration.published) {
      const title = `${queryData.registration.exam.name} -- Submission for ${queryData.registration.user.displayName}`;
      return (
        <DocumentTitle title={title}>
          <NavbarBreadcrumbs items={items} />
          <h1>{`Submission for ${queryData.registration.exam.name}`}</h1>
          <p>Your submission is not yet graded, and cannot be viewed at this time.</p>
        </DocumentTitle>
      );
    }
    return (
      <>
        <NavbarBreadcrumbs items={items} />
        <ExamSubmissionStudent />
      </>
    );
  }
  const items: NavbarItem[] = useMemo(() => [
    [`/courses/${queryData.registration.exam.course.id}`, queryData.registration.exam.course.title],
    [`/exams/${examId}/admin`, queryData.registration.exam.name],
    [`/exams/${examId}/submissions`, 'Submissions'],
    [undefined,
      queryData.registration.published
        ? queryData.registration.user.displayName
        : <Spoiler text={queryData.registration.user.displayName} />],
  ], [
    queryData.registration.exam.course.id,
    queryData.registration.exam.course.title,
    queryData.registration.exam.name,
    queryData.registration.exam.id,
  ]);
  return (
    <>
      <NavbarBreadcrumbs items={items} />
      <ExamSubmissionStaff />
    </>
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
        rubricsOpen={false}
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
      <Route path="/exams/:examId/submissions/manage" exact>
        Management
      </Route>
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
