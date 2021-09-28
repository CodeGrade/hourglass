import React, {
  useState,
  useEffect,
  useContext,
  createRef,
  useCallback,
} from 'react';
import {
  Switch,
  Route,
  useParams,
  useHistory,
  Redirect,
  useLocation,
  Link,
} from 'react-router-dom';
import { pluralize, useRefresher } from '@hourglass/common/helpers';
import { NumericInput } from '@hourglass/common/NumericInput';
import {
  Card,
  Collapse,
  Button,
  Form,
  Row,
  Col,
  DropdownButton,
  Dropdown,
  Tab,
  Nav,
  Container,
} from 'react-bootstrap';
import {
  FaChevronUp,
  FaChevronDown,
  FaCheck,
  FaTimes,
  FaUserClock,
} from 'react-icons/fa';
import Icon from '@student/exams/show/components/Icon';
import ExamViewer from '@proctor/registrations/show';
import LinkButton from '@hourglass/common/linkbutton';
import ReadableDate from '@hourglass/common/ReadableDate';
import { AlertContext } from '@hourglass/common/alerts';
import DateTimePicker from '@professor/exams/new/DateTimePicker';
import TooltipButton from '@student/exams/show/components/TooltipButton';
import { DateTime } from 'luxon';
import { MdWarning, MdDoNotDisturb } from 'react-icons/md';
import Tooltip from '@student/exams/show/components/Tooltip';
import EditExamRooms from '@professor/exams/rooms';
import ManageAccommodations from '@professor/exams/accommodations';
import AssignSeating from '@hourglass/common/student-dnd';
import AllocateVersions from '@professor/exams/allocate-versions';
import AssignStaff from '@professor/exams/assign-staff';
import ErrorBoundary, { RenderError } from '@hourglass/common/boundary';
import { BsPencilSquare, BsFillQuestionCircleFill } from 'react-icons/bs';
import { GiOpenBook } from 'react-icons/gi';
import DocumentTitle from '@hourglass/common/documentTitle';
import { policyToString } from '@professor/exams/new/editor/Policies';
import {
  graphql,
  useFragment,
  useMutation,
  useQuery,
} from 'relay-hooks';
import { uploadFile } from '@hourglass/common/types/api';
import './dnd.scss';

import { adminExamQuery } from './__generated__/adminExamQuery.graphql';
import { admin_examInfo$key } from './__generated__/admin_examInfo.graphql';
import { admin_publishGrades$key } from './__generated__/admin_publishGrades.graphql';
import { adminUpdateExamMutation } from './__generated__/adminUpdateExamMutation.graphql';
import { adminPublishGradesMutation } from './__generated__/adminPublishGradesMutation.graphql';
import { ChecklistItemStatus, admin_checklist$key } from './__generated__/admin_checklist.graphql';
import { admin_versionInfo$key } from './__generated__/admin_versionInfo.graphql';
import { admin_version$key } from './__generated__/admin_version.graphql';
import { admin_preview_version$key } from './__generated__/admin_preview_version.graphql';
import { adminCreateVersionMutation } from './__generated__/adminCreateVersionMutation.graphql';
import { adminDestroyVersionMutation } from './__generated__/adminDestroyVersionMutation.graphql';

export interface ExamUpdateInfo {
  name: string;
  start: string;
  end: string;
  duration: number;
}

const ExamInformation: React.FC<{
  exam: admin_examInfo$key;
}> = (props) => {
  const {
    exam,
  } = props;
  const { alert } = useContext(AlertContext);
  const [editing, setEditing] = useState(false);
  const flipEditing = useCallback(() => setEditing((e) => !e), []);
  const examInfo = useFragment<admin_examInfo$key>(
    graphql`
    fragment admin_examInfo on Exam {
      id
      name
      startTime
      endTime
      duration
    }
    `,
    exam,
  );
  const [mutate, { loading }] = useMutation<adminUpdateExamMutation>(
    graphql`
      mutation adminUpdateExamMutation($input: UpdateExamInput!) {
        updateExam(input: $input) {
          exam {
            name
            duration
            startTime
            endTime
          }
        }
      }
    `,
    {
      onCompleted: () => {
        setEditing(false);
        alert({
          variant: 'success',
          autohide: true,
          message: 'Exam info saved.',
        });
      },
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error saving exam info.',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  const startTime = DateTime.fromISO(examInfo.startTime);
  const endTime = DateTime.fromISO(examInfo.endTime);
  return (
    <Form.Group>
      {editing ? (
        <ExamInfoEditor
          disabled={loading}
          name={examInfo.name}
          startTime={startTime}
          endTime={endTime}
          duration={examInfo.duration}
          onCancel={flipEditing}
          onSubmit={(info) => {
            mutate({
              variables: {
                input: {
                  examId: examInfo.id,
                  name: info.name,
                  duration: info.duration,
                  startTime: info.start,
                  endTime: info.end,
                },
              },
            });
          }}
        />
      ) : (
        <ExamInfoViewer
          onClickEdit={flipEditing}
          name={examInfo.name}
          startTime={startTime}
          endTime={endTime}
          duration={examInfo.duration}
        />
      )}
    </Form.Group>
  );
};

const ChecklistIcon: React.FC<{
  status: ChecklistItemStatus;
  reason: string;
}> = (props) => {
  const {
    status,
    reason,
  } = props;
  let contents;
  switch (status) {
    case 'WARNING':
      contents = <Icon I={MdWarning} className="text-warning" />;
      break;
    case 'NA':
      contents = <Icon I={MdDoNotDisturb} />;
      break;
    case 'COMPLETE':
      contents = <Icon I={FaCheck} className="text-success" />;
      break;
    case 'NOT_STARTED':
      contents = <Icon I={FaTimes} className="text-danger" />;
      break;
    default:
      contents = <Icon I={BsFillQuestionCircleFill} className="text-danger" />;
      break;
  }
  return (
    <Tooltip message={reason}>
      <span>
        {contents}
      </span>
    </Tooltip>
  );
};

const TabbedChecklist: React.FC<{
  exam: admin_checklist$key;
  examId: string;
}> = (props) => {
  const {
    exam,
    examId,
  } = props;
  return (
    <Switch>
      <Route path="/exams/:examId/admin/:tabName">
        <PreFlightChecklist
          exam={exam}
        />
      </Route>
      <Route>
        <Redirect to={`/exams/${examId}/admin/edit-versions`} />
      </Route>
    </Switch>
  );
};

const PreFlightChecklist: React.FC<{
  exam: admin_checklist$key;
}> = (props) => {
  const {
    exam,
  } = props;
  const res = useFragment(
    graphql`
    fragment admin_checklist on Exam {
      ...admin_versionInfo
      ...accommodations_all
      ...allocateVersions
      ...roomsIndex
      ...assignStaff
      ...studentDnd
      name
      checklist {
        rooms {
          reason
          status
        }
        staff {
          reason
          status
        }
        seating {
          reason
          status
        }
        versions {
          reason
          status
        }
      }
    }
    `,
    exam,
  );
  const { checklist } = res;
  const history = useHistory();
  const { examId, tabName } = useParams<{ examId: string, tabName: string }>();
  return (
    <>
      <h1>Pre-flight Checklist</h1>
      <Tab.Container activeKey={tabName}>
        <Nav
          variant="tabs"
          activeKey={tabName}
        >
          <Nav.Item>
            <Nav.Link
              eventKey="edit-versions"
              onClick={() => history.push(`/exams/${examId}/admin/edit-versions`)}
            >
              <Icon I={GiOpenBook} />
              <span className="ml-2">
                Edit versions
              </span>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="rooms"
              onClick={() => history.push(`/exams/${examId}/admin/rooms`)}
            >
              <ChecklistIcon
                reason={checklist.rooms.reason}
                status={checklist.rooms.status}
              />
              <span className="ml-2">
                Edit rooms
              </span>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="staff"
              onClick={() => history.push(`/exams/${examId}/admin/staff`)}
            >
              <ChecklistIcon
                reason={checklist.staff.reason}
                status={checklist.staff.status}
              />
              <span className="ml-2">
                Assign staff members
              </span>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="versions"
              onClick={() => history.push(`/exams/${examId}/admin/versions`)}
            >
              <ChecklistIcon
                reason={checklist.versions.reason}
                status={checklist.versions.status}
              />
              <span className="ml-2">
                Allocate versions
              </span>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="seating"
              onClick={() => history.push(`/exams/${examId}/admin/seating`)}
            >
              <ChecklistIcon
                reason={checklist.seating.reason}
                status={checklist.seating.status}
              />
              <span className="ml-2">
                Assign seating
              </span>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="accommodations"
              onClick={() => history.push(`/exams/${examId}/admin/accommodations`)}
            >
              <Icon I={FaUserClock} />
              <span className="ml-2">
                Accommodations
              </span>
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <Tab.Content className="border border-top-0 rounded-bottom p-3">
          <Tab.Pane eventKey="edit-versions">
            <ErrorBoundary>
              <VersionInfo exam={res} />
            </ErrorBoundary>
          </Tab.Pane>
          <Tab.Pane eventKey="rooms">
            <ErrorBoundary>
              <EditExamRooms examKey={res} />
            </ErrorBoundary>
          </Tab.Pane>
          <Tab.Pane eventKey="staff">
            <ErrorBoundary>
              <AssignStaff examKey={res} />
            </ErrorBoundary>
          </Tab.Pane>
          <Tab.Pane eventKey="versions">
            <ErrorBoundary>
              <AllocateVersions examKey={res} />
            </ErrorBoundary>
          </Tab.Pane>
          <Tab.Pane eventKey="seating">
            <ErrorBoundary>
              <AssignSeating examKey={res} />
            </ErrorBoundary>
          </Tab.Pane>
          <Tab.Pane eventKey="accommodations">
            <ErrorBoundary>
              <ManageAccommodations exam={res} />
            </ErrorBoundary>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </>
  );
};

export const TabEditButton: React.FC = () => {
  const { examId, tabName } = useParams<{ examId: string, tabName: string }>();
  return (
    <LinkButton
      to={`/exams/${examId}/admin/${tabName}/edit`}
    >
      <Icon I={BsPencilSquare} />
      <span className="ml-2">
        Edit
      </span>
    </LinkButton>
  );
};

export function useTabRefresher(currentTab: string): [number, () => void] {
  const [refresher, refresh] = useRefresher();
  const location = useLocation();
  const { tabName } = useParams<{ tabName: string }>();
  useEffect(() => {
    if (tabName === currentTab) refresh();
  }, [tabName, location.pathname]);
  return [refresher, refresh];
}

const ExamInfoViewer: React.FC<{
  onClickEdit: () => void;
  name: string;
  startTime: DateTime;
  endTime: DateTime;
  duration: number;
}> = (props) => {
  const {
    onClickEdit,
    name,
    startTime,
    endTime,
    duration,
  } = props;
  return (
    <Card>
      <Card.Body>
        <h1>
          {name}
          <span className="float-right">
            <Button
              variant="primary"
              onClick={onClickEdit}
            >
              <Icon I={BsPencilSquare} />
              <span className="ml-2">Edit</span>
            </Button>
          </span>
        </h1>
        <Row className="align-items-center">
          <Form.Label column sm={2}>Starts:</Form.Label>
          <ReadableDate value={startTime} showTime />
        </Row>
        <Row className="align-items-center">
          <Form.Label column sm={2}>Ends:</Form.Label>
          <ReadableDate value={endTime} showTime />
        </Row>
        <Row className="align-items-center">
          <Form.Label column sm={2}>Duration:</Form.Label>
          {`${duration / 60.0} minutes`}
        </Row>
      </Card.Body>
    </Card>
  );
};

export const ExamInfoEditor: React.FC<{
  disabled: boolean;
  onSubmit: (info: ExamUpdateInfo) => void;
  onCancel: () => void;
  name: string;
  startTime: DateTime;
  endTime: DateTime;
  duration: number;
}> = (props) => {
  const {
    disabled,
    onSubmit,
    onCancel,
    name: defaultName,
    startTime: defaultStartTime,
    endTime: defaultEndTime,
    duration: defaultDuration,
  } = props;
  const [name, setName] = useState<string>(defaultName);
  const [start, setStart] = useState<DateTime>(defaultStartTime);
  const [end, setEnd] = useState<DateTime>(defaultEndTime);
  const [duration, setDuration] = useState<number | string>(`${defaultDuration / 60.0}`);

  return (
    <Card className="mb-4">
      <Card.Body>
        <Form.Group as={Row} controlId="examTitle" className="align-items-center">
          <Form.Label column sm={2}>
            Exam name:
          </Form.Label>
          <Col>
            <Form.Control
              disabled={disabled}
              type="input"
              value={name}
              onChange={(e): void => setName(e.target.value)}
            />
          </Col>
          <span className="float-right">
            <Button
              disabled={disabled}
              variant="danger"
              onClick={(): void => onCancel()}
            >
              Cancel
            </Button>
            <Button
              disabled={disabled}
              variant="success"
              className="ml-2"
              onClick={(): void => {
                onSubmit({
                  name,
                  duration: Number(duration) * 60.0,
                  start: start.toISO(),
                  end: end.toISO(),
                });
              }}
            >
              Save
            </Button>
          </span>
          <div className="col flex-grow-0 pl-0" />
        </Form.Group>
        <Form.Group as={Row} controlId="examStartTime" className="align-items-center">
          <Form.Label column sm={2}>Start time:</Form.Label>
          <Col>
            <DateTimePicker
              disabled={disabled}
              value={start}
              maxValue={end}
              onChange={setStart}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="examEndTime" className="align-items-center">
          <Form.Label column sm={2}>End time:</Form.Label>
          <Col>
            <DateTimePicker
              disabled={disabled}
              value={end}
              minValue={start}
              onChange={setEnd}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="examDuration" className="align-items-center">
          <Form.Label column sm={2}>Duration (minutes):</Form.Label>
          <Col>
            <NumericInput
              disabled={disabled}
              value={duration}
              className="overflow-visible"
              variant="primary"
              min={0}
              onChange={setDuration}
            />
          </Col>
        </Form.Group>
      </Card.Body>
    </Card>
  );
};

const VersionInfo: React.FC<{
  exam: admin_versionInfo$key;
}> = (props) => {
  const {
    exam,
  } = props;
  const res = useFragment<admin_versionInfo$key>(
    graphql`
    fragment admin_versionInfo on Exam {
      id
      name
      examVersionUploadUrl
      examVersions(first: 100) @connection(key: "Exam_examVersions", filters: []) {
        edges {
          node {
            id
            ...admin_version
          }
        }
      }
    }
    `,
    exam,
  );
  const { alert } = useContext(AlertContext);
  const history = useHistory();
  const fileInputRef = createRef<HTMLInputElement>();
  const [createVersion, { loading }] = useMutation<adminCreateVersionMutation>(
    graphql`
    mutation adminCreateVersionMutation($input: CreateExamVersionInput!) {
      createExamVersion(input: $input) {
        examVersion {
          id
        }
      }
    }
    `,
    {
      onCompleted: ({ createExamVersion }) => {
        history.push(`/exams/${res.id}/versions/${createExamVersion.examVersion.id}/edit`);
      },
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Exam version not created.',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  return (
    <>
      <h2>
        Versions
        <div className="float-right">
          <input
            type="file"
            ref={fileInputRef}
            hidden
            onChange={(event) => {
              const { files } = event.target;
              const [f] = files;
              if (!f) return;
              uploadFile<{ id: number; }>(res.examVersionUploadUrl, f).then((innerRes) => {
                history.push(`/exams/${res.id}/versions/${innerRes.id}/edit`);
                alert({
                  variant: 'success',
                  autohide: true,
                  message: 'Exam version successfully imported',
                });
              }).catch((err) => {
                alert({
                  variant: 'danger',
                  title: 'Exam version not imported',
                  message: err.message,
                  copyButton: true,
                });
              });
            }}
          />
          <Button
            disabled={loading}
            className="mr-2"
            variant="success"
            onClick={(): void => {
              fileInputRef.current.click();
            }}
          >
            Import Version
          </Button>
          <Button
            disabled={loading}
            variant="success"
            onClick={(): void => {
              createVersion({
                variables: {
                  input: {
                    examId: res.id,
                  },
                },
              });
            }}
          >
            New Version
          </Button>
        </div>
      </h2>
      <ul>
        {res.examVersions.edges.map(({ node: version }) => (
          <li key={version.id}>
            <ShowVersion
              examId={res.id}
              version={version}
            />
          </li>
        ))}
      </ul>
    </>
  );
};

const ShowVersion: React.FC<{
  examId: string;
  version: admin_version$key;
}> = (props) => {
  const {
    examId,
    version,
  } = props;
  const res = useFragment(
    graphql`
    fragment admin_version on ExamVersion {
      id
      name
      anyStarted
      anyFinalized
      fileExportUrl
      archiveExportUrl
      ...admin_preview_version
    }
    `,
    version,
  );
  const { alert } = useContext(AlertContext);
  const [preview, setPreview] = useState(false);
  const [mutate, { loading }] = useMutation<adminDestroyVersionMutation>(
    graphql`
    mutation adminDestroyVersionMutation($input: DestroyExamVersionInput!) {
      destroyExamVersion(input: $input) {
        deletedId
      }
    }
    `,
    {
      onCompleted: () => {
        alert({
          variant: 'success',
          autohide: true,
          message: 'Version deleted successfully.',
        });
      },
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error deleting version.',
          message: err.message,
          copyButton: true,
        });
      },
      configs: [
        {
          type: 'RANGE_DELETE',
          parentID: examId,
          connectionKeys: [{
            key: 'Exam_examVersions',
          }],
          pathToConnection: ['exam', 'examVersions'],
          deletedIDFieldName: 'deletedId',
        },
      ],
    },
  );
  let disabledDeleteMessage = '';
  if (res.anyFinalized) {
    disabledDeleteMessage = 'Students have already finished taking this exam version';
  } else if (res.anyStarted) {
    disabledDeleteMessage = 'Students have already started taking this exam version';
  } else if (loading) {
    disabledDeleteMessage = 'Please wait...';
  }
  return (
    <>
      <h3 className="flex-grow-1">
        <span
          role="button"
          onClick={(): void => setPreview((o) => !o)}
          onKeyPress={(): void => setPreview((o) => !o)}
          tabIndex={0}
        >
          {res.name}
          {preview ? <Icon I={FaChevronUp} /> : <Icon I={FaChevronDown} />}
        </span>
        <div className="float-right">
          <DropdownButton
            disabled={loading}
            id={`version-${res.id}-export-button`}
            className="d-inline-block mr-2"
            title="Export"
          >
            <Dropdown.Item
              disabled={loading}
              href={res.fileExportUrl}
            >
              Export as single file
            </Dropdown.Item>
            <Dropdown.Item
              disabled={loading}
              href={res.archiveExportUrl}
            >
              Export as archive
            </Dropdown.Item>
          </DropdownButton>
          <LinkButton
            id={`edit-${res.id}`}
            disabled={loading}
            variant="info"
            to={`/exams/${examId}/versions/${res.id}/edit`}
            className="mr-2"
            title="Edit"
          >
            Edit
          </LinkButton>
          <TooltipButton
            variant="danger"
            disabled={res.anyStarted || res.anyFinalized || loading}
            disabledMessage={disabledDeleteMessage}
            cursorClass="cursor-not-allowed"
            onClick={(): void => {
              mutate({
                variables: {
                  input: {
                    examVersionId: res.id,
                  },
                },
              });
            }}
          >
            Delete
          </TooltipButton>
        </div>
      </h3>
      <ErrorBoundary>
        <PreviewVersion
          open={preview}
          version={res}
        />
      </ErrorBoundary>
    </>
  );
};

const PreviewVersion: React.FC<{
  open: boolean;
  version: admin_preview_version$key;
}> = (props) => {
  const {
    open,
    version,
  } = props;
  const res = useFragment(
    graphql`
    fragment admin_preview_version on ExamVersion {
      policies
      ...showExamViewer
    }
    `,
    version,
  );
  return (
    <Collapse in={open}>
      <div>
        <h6>
          Policies:
          <span className="ml-4">
            {res.policies.map((policy) => policyToString[policy]).join(', ')}
          </span>
        </h6>
        <div className="border p-2">
          <ExamViewer
            version={res}
            overviewMode
            refreshCodeMirrorsDeps={[open]}
          />
        </div>
      </div>
    </Collapse>
  );
};

const COMMENCE_GRADING_MUTATION = graphql`
mutation adminCommenceGradingMutation($input: CommenceGradingInput!) {
  commenceGrading(input: $input) {
    success
  }
}
`;

const StartGradingButton: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const history = useHistory();
  const { alert } = useContext(AlertContext);
  const [mutate, { loading }] = useMutation(
    COMMENCE_GRADING_MUTATION,
    {
      onCompleted: () => {
        history.push(`/exams/${examId}/grading/admin`);
      },
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error setting up grading',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );
  return (
    <Button
      disabled={loading}
      variant="success"
      onClick={async () => {
        mutate({
          variables: {
            input: {
              examId,
            },
          },
        });
      }}
    >
      Grade!
    </Button>
  );
};

const PublishGradesButton: React.FC<{
  examId: admin_publishGrades$key;
}> = ({ examId }) => {
  const res = useFragment(
    graphql`
    fragment admin_publishGrades on Exam {
      id
      graded
    }
    `,
    examId,
  );
  const { alert } = useContext(AlertContext);
  const [publish, { loading }] = useMutation<adminPublishGradesMutation>(
    graphql`
      mutation adminPublishGradesMutation($input: PublishGradesInput!) {
        publishGrades(input: $input) {
          published
          count
        }
      }
    `,
    {
      onCompleted: ({ publishGrades }) => {
        const { count, published } = publishGrades;
        alert({
          variant: 'success',
          autohide: true,
          message: `${pluralize(count, 'exam', 'exams')} ${published ? 'published' : 'unpublished'}`,
        });
      },
      onError: (err) => {
        alert({
          variant: 'danger',
          title: 'Error publishing grades.',
          message: err.message,
          copyButton: true,
        });
      },
    },
  );

  const disabled = loading || !res.graded;
  const reason = loading ? 'Loading...' : 'Not all exams are graded yet';
  return (
    <Tooltip
      showTooltip={disabled}
      message={reason}
      placement="bottom"
    >
      <DropdownButton
        disabled={disabled}
        className="d-inline-block ml-2"
        variant="success"
        title="Publish..."
      >
        <Dropdown.Item
          onClick={() => {
            publish({
              variables: {
                input: {
                  examId: res.id,
                  published: true,
                },
              },
            });
          }}
        >
          Publish all grades
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => {
            publish({
              variables: {
                input: {
                  examId: res.id,
                  published: false,
                },
              },
            });
          }}
        >
          Unpublish all grades
        </Dropdown.Item>
      </DropdownButton>
    </Tooltip>
  );
};

const ExamAdmin: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const res = useQuery<adminExamQuery>(
    graphql`
    query adminExamQuery($examId: ID!, $withRubric: Boolean!) {
      exam(id: $examId) {
        id
        name
        startTime
        endTime
        duration
        ...admin_publishGrades
        ...admin_examInfo
        ...admin_checklist
      }
    }
    `,
    { examId, withRubric: true },
  );
  if (res.error) {
    return <Container><RenderError error={res.error} /></Container>;
  }
  if (!res.data) {
    return <Container><p>Loading...</p></Container>;
  }
  return (
    <DocumentTitle title={res.data.exam.name}>
      <Container>
        <ExamInformation exam={res.data.exam} />
        <Form.Group>
          <TabbedChecklist
            exam={res.data.exam}
            examId={examId}
          />
        </Form.Group>
        <Form.Group>
          <Link to={`/exams/${res.data.exam.id}/proctoring`}>
            <Button className="mr-2" variant="success">Proctor!</Button>
          </Link>
          <StartGradingButton />
          <PublishGradesButton examId={res.data.exam} />
          <Link to={`/exams/${res.data.exam.id}/submissions`}>
            <Button className="ml-2" variant="primary">View submissions</Button>
          </Link>
        </Form.Group>
      </Container>
    </DocumentTitle>
  );
};

export default ExamAdmin;
