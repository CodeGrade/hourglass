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
import {
  Response as ShowResponse,
  Version,
  Checklist,
  ChecklistItemStatus,
} from '@hourglass/common/api/professor/exams/show';
import { ExhaustiveSwitchError, useRefresher } from '@hourglass/common/helpers';
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
import { RailsExamVersion, ContentsState } from '@student/exams/show/types';
import { Editor as CodeMirrorEditor } from 'codemirror';
import LinkButton from '@hourglass/common/linkbutton';
import ReadableDate from '@hourglass/common/ReadableDate';
import { AlertContext } from '@hourglass/common/alerts';
import DateTimePicker from '@professor/exams/new/DateTimePicker';
import createVersion from '@hourglass/common/api/professor/exams/versions/create';
import deleteVersion from '@hourglass/common/api/professor/exams/versions/delete';
import TooltipButton from '@student/exams/show/components/TooltipButton';
import { DateTime } from 'luxon';
import { importVersion } from '@hourglass/common/api/professor/exams/versions/import';
import { MdWarning, MdDoNotDisturb } from 'react-icons/md';
import Tooltip from '@hourglass/workflows/student/exams/show/components/Tooltip';
import EditExamRooms from '@professor/exams/rooms';
import ManageAccommodations from '@professor/exams/accommodations';
import AssignSeating from '@hourglass/common/student-dnd';
import AllocateVersions from '@professor/exams/allocate-versions';
import AssignStaff from '@professor/exams/assign-staff';
import ErrorBoundary from '@hourglass/common/boundary';
import { BsPencilSquare } from 'react-icons/bs';
import { GiOpenBook } from 'react-icons/gi';
import DocumentTitle from '@hourglass/common/documentTitle';
import Loading from '@hourglass/common/loading';
import { QueryRenderer, graphql } from 'react-relay';
import environment from '@hourglass/relay/environment';
import { useFragment, useMutation } from 'relay-hooks';
import { adminExamQuery } from './__generated__/adminExamQuery.graphql';
import { admin_examInfo$key } from './__generated__/admin_examInfo.graphql';

export interface ExamUpdateInfo {
  name: string;
  start: string;
  end: string;
  duration: number;
}

const loadingStatus = {
  reason: 'Loading...',
  status: ChecklistItemStatus.NotStarted,
};

const emptyResponse: ShowResponse = {
  start: DateTime.local(),
  end: DateTime.local(),
  name: 'Exam',
  duration: 0,
  versions: [],
  checklist: {
    rooms: loadingStatus,
    staff: loadingStatus,
    seating: loadingStatus,
    versions: loadingStatus,
  },
};

const Loaded: React.FC<{
  refresh: () => void;
  response: ShowResponse;
  exam: admin_examInfo$key;
  examID: string;
}> = (props) => {
  const {
    refresh,
    response,
    exam,
    examID,
  } = props;
  const { examId } = useParams();
  const { alert } = useContext(AlertContext);
  const [editing, setEditing] = useState(false);
  const flipEditing = useCallback(() => setEditing((e) => !e), []);
  const onError = (emsg) => {
    alert({
      variant: 'danger',
      title: 'Error saving exam info.',
      message: emsg,
    });
  };
  const [mutate, { loading }] = useMutation(
    graphql`
      mutation adminUpdateExamMutation($input: UpdateExamInput!) {
        updateExam(input: $input) {
          errors
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
      onError: (err) => {
        onError(err.message);
      },
      onCompleted: ({ updateExam }) => {
        if (updateExam.errors.length !== 0) {
          onError(updateExam.errors.join('\n'));
          return;
        }
        setEditing(false);
        alert({
          variant: 'success',
          autohide: true,
          message: 'Exam info saved.',
        });
      },
    },
  );
  return (
    <>
      <Form.Group>
        {editing ? (
          <ExamInfoEditor
            exam={exam}
            onCancel={flipEditing}
            onSubmit={(info) => {
              mutate({
                variables: {
                  input: {
                    examId: examID,
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
            onEdit={flipEditing}
            response={response}
          />
        )}
      </Form.Group>
      <Form.Group>
        <TabbedChecklist
          refresh={refresh}
          examId={examId}
          checklist={response.checklist}
          versions={response.versions}
          examName={response.name}
        />
      </Form.Group>
      <Form.Group>
        <Link to={`/exams/${examId}/proctoring`}>
          <Button variant="success">Proctor!</Button>
        </Link>
        <Link to={`/exams/${examId}/submissions`}>
          <Button className="ml-2" variant="primary">View submissions</Button>
        </Link>
      </Form.Group>
    </>
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
    case ChecklistItemStatus.Warning:
      contents = <Icon I={MdWarning} className="text-warning" />;
      break;
    case ChecklistItemStatus.NA:
      contents = <Icon I={MdDoNotDisturb} />;
      break;
    case ChecklistItemStatus.Complete:
      contents = <Icon I={FaCheck} className="text-success" />;
      break;
    case ChecklistItemStatus.NotStarted:
      contents = <Icon I={FaTimes} className="text-danger" />;
      break;
    default:
      throw new ExhaustiveSwitchError(status);
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
  refresh: () => void;
  examId: number;
  checklist: Checklist;
  examName: string;
  versions: Version[];
}> = (props) => {
  const {
    refresh,
    examId,
    checklist,
    examName,
    versions,
  } = props;
  return (
    <Switch>
      <Route path="/exams/:examId/admin/:tabName">
        <PreFlightChecklist
          refresh={refresh}
          checklist={checklist}
          examName={examName}
          versions={versions}
        />
      </Route>
      <Route>
        <Redirect to={`/exams/${examId}/admin/edit-versions`} />
      </Route>
    </Switch>
  );
};

const PreFlightChecklist: React.FC<{
  refresh: () => void;
  checklist: Checklist;
  examName: string;
  versions: Version[];
}> = (props) => {
  const {
    refresh,
    checklist,
    examName,
    versions,
  } = props;
  const history = useHistory();
  const { examId, tabName } = useParams();
  const location = useLocation();
  useEffect(refresh, [location.pathname]);
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
              <VersionInfo
                refresh={refresh}
                examName={examName}
                versions={versions}
              />
            </ErrorBoundary>
          </Tab.Pane>
          <Tab.Pane eventKey="rooms">
            <ErrorBoundary>
              <EditExamRooms />
            </ErrorBoundary>
          </Tab.Pane>
          <Tab.Pane eventKey="staff">
            <ErrorBoundary>
              <AssignStaff />
            </ErrorBoundary>
          </Tab.Pane>
          <Tab.Pane eventKey="versions">
            <ErrorBoundary>
              <AllocateVersions />
            </ErrorBoundary>
          </Tab.Pane>
          <Tab.Pane eventKey="seating">
            <ErrorBoundary>
              <AssignSeating />
            </ErrorBoundary>
          </Tab.Pane>
          <Tab.Pane eventKey="accommodations">
            <ErrorBoundary>
              <ManageAccommodations />
            </ErrorBoundary>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </>
  );
};

export const TabEditButton: React.FC = () => {
  const { examId, tabName } = useParams();
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
  const { tabName } = useParams();
  useEffect(() => {
    if (tabName === currentTab) refresh();
  }, [tabName, location.pathname]);
  return [refresher, refresh];
}

const ExamInfoViewer: React.FC<{
  onEdit: () => void;
  response: ShowResponse;
}> = (props) => {
  const {
    onEdit,
    response,
  } = props;
  const {
    start,
    end,
    duration,
  } = response;
  return (
    <Card>
      <Card.Body>
        <h1>
          {response.name}
          <span className="float-right">
            <Button
              variant="primary"
              onClick={onEdit}
            >
              <Icon I={BsPencilSquare} />
              <span className="ml-2">Edit</span>
            </Button>
          </span>
        </h1>
        <Row>
          <Form.Label column sm={2}>Starts:</Form.Label>
          <ReadableDate value={start} showTime />
        </Row>
        <Row>
          <Form.Label column sm={2}>Ends:</Form.Label>
          <ReadableDate value={end} showTime />
        </Row>
        <Row>
          <Form.Label column sm={2}>Duration:</Form.Label>
          {`${duration / 60.0} minutes`}
        </Row>
      </Card.Body>
    </Card>
  );
};

const NINETY_MINUTES = 5400;

export const ExamInfoEditor: React.FC<{
  exam: admin_examInfo$key;
  onSubmit: (info: ExamUpdateInfo) => void;
  onCancel: () => void;
}> = (props) => {
  const {
    exam,
    onSubmit,
    onCancel,
  } = props;
  const examInfo = useFragment(
    graphql`
    fragment admin_examInfo on Exam {
      name
      startTime
      endTime
      duration
    }
    `,
    exam,
  );
  const [name, setName] = useState<string>(examInfo.name);
  const [start, setStart] = useState<DateTime>(DateTime.fromISO(examInfo.startTime));
  const [end, setEnd] = useState<DateTime>(DateTime.fromISO(examInfo.endTime));
  const [duration, setDuration] = useState<number>(examInfo.duration);

  return (
    <Card className="mb-4">
      <Card.Body>
        <Form.Group as={Row} controlId="examTitle">
          <Form.Label column sm={2}>
            Exam name:
          </Form.Label>
          <Col>
            <Form.Control
              type="input"
              value={name}
              onChange={(e): void => setName(e.target.value)}
            />
          </Col>
          <span className="float-right">
            <Button
              variant="danger"
              onClick={(): void => onCancel()}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              className="ml-2"
              onClick={(): void => {
                onSubmit({
                  name,
                  duration,
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
        <Form.Group as={Row} controlId="examStartTime">
          <Form.Label column sm={2}>Start time:</Form.Label>
          <Col>
            <DateTimePicker
              value={start}
              maxValue={end}
              onChange={setStart}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="examEndTime">
          <Form.Label column sm={2}>End time:</Form.Label>
          <Col>
            <DateTimePicker
              value={end}
              minValue={start}
              onChange={setEnd}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="examDuration">
          <Form.Label column sm={2}>Duration (minutes):</Form.Label>
          <Col>
            <Form.Control
              type="number"
              value={duration / 60.0}
              onChange={(e): void => setDuration(Number(e.target.value) * 60)}
            />
          </Col>
        </Form.Group>
      </Card.Body>
    </Card>
  );
};

const VersionInfo: React.FC<{
  examName: string;
  versions: Version[];
  refresh: () => void;
}> = (props) => {
  const {
    examName,
    versions,
    refresh,
  } = props;
  const { alert } = useContext(AlertContext);
  const { examId } = useParams();
  const history = useHistory();
  const fileInputRef = createRef<HTMLInputElement>();
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
              importVersion(examId, f).then((res) => {
                history.push(`/exams/${examId}/versions/${res.id}/edit`);
                alert({
                  variant: 'success',
                  autohide: true,
                  message: 'Exam version successfully imported.',
                });
              }).catch((err) => {
                alert({
                  variant: 'danger',
                  title: 'Exam version not imported.',
                  message: err.message,
                });
              });
            }}
          />
          <Button
            className="mr-2"
            variant="success"
            onClick={(): void => {
              fileInputRef.current.click();
            }}
          >
            Import Version
          </Button>
          <Button
            variant="success"
            onClick={(): void => {
              createVersion(examId).then((res) => {
                history.push(`/exams/${examId}/versions/${res.id}/edit`);
              }).catch((err) => {
                alert({
                  variant: 'danger',
                  title: 'Exam version not created.',
                  message: err.message,
                });
              });
            }}
          >
            New Version
          </Button>
        </div>
      </h2>
      <ul>
        {versions.map((v) => (
          <li key={v.id}>
            <ShowVersion
              version={v}
              examName={examName}
              refresh={refresh}
            />
          </li>
        ))}
      </ul>
    </>
  );
};

const ShowVersion: React.FC<{
  version: Version;
  examName: string;
  refresh: () => void;
}> = (props) => {
  const {
    version,
    examName,
    refresh,
  } = props;
  const { examId } = useParams();
  const { alert } = useContext(AlertContext);
  const [preview, setPreview] = useState(false);
  return (
    <>
      <h3 className="flex-grow-1">
        <span
          role="button"
          onClick={(): void => setPreview((o) => !o)}
          onKeyPress={(): void => setPreview((o) => !o)}
          tabIndex={0}
        >
          {version.name}
          {preview ? <Icon I={FaChevronUp} /> : <Icon I={FaChevronDown} />}
        </span>
        <div className="float-right">
          <DropdownButton
            id={`version-${version.id}-export-button`}
            className="d-inline-block mr-2"
            title="Export"
          >
            <Dropdown.Item
              href={`/api/professor/versions/${version.id}/export_file`}
            >
              Export as single file
            </Dropdown.Item>
            <Dropdown.Item
              href={`/api/professor/versions/${version.id}/export_archive`}
            >
              Export as archive
            </Dropdown.Item>
          </DropdownButton>
          <LinkButton
            variant="info"
            to={`/exams/${examId}/versions/${version.id}/edit`}
            className="mr-2"
          >
            Edit
          </LinkButton>
          <TooltipButton
            variant="danger"
            disabled={version.anyStarted}
            disabledMessage="Students have already started taking this exam version"
            cursorClass="cursor-not-allowed"
            onClick={(): void => {
              deleteVersion(version.id).then(() => {
                refresh();
                alert({
                  variant: 'success',
                  autohide: true,
                  message: 'Version deleted successfully.',
                });
              }).catch((err) => {
                alert({
                  variant: 'danger',
                  title: 'Error deleting version.',
                  message: err.message,
                });
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
          railsExam={{
            id: examId,
            name: examName,
            policies: version.policies,
          }}
          contents={version.contents}
        />
      </ErrorBoundary>
    </>
  );
};

interface CodeMirroredElement extends Element {
  CodeMirror: CodeMirrorEditor;
}

const PreviewVersion: React.FC<{
  open: boolean;
  contents: ContentsState;
  railsExam: RailsExamVersion;
}> = (props) => {
  const {
    open,
    contents,
    railsExam,
  } = props;
  useEffect(() => {
    if (!open) return;
    document.querySelectorAll('.CodeMirror').forEach((cm) => {
      setTimeout(() => (cm as CodeMirroredElement).CodeMirror.refresh());
    });
  }, [open]);
  return (
    <Collapse in={open}>
      <div className="border p-2">
        <ExamViewer
          railsExam={railsExam}
          contents={contents}
        />
      </div>
    </Collapse>
  );
};

const ExamAdmin: React.FC = () => {
  const { examId } = useParams();
  return (
    <QueryRenderer<adminExamQuery>
      environment={environment}
      query={graphql`
        query adminExamQuery($examRailsId: Int!) {
          exam(railsId: $examRailsId) {
            ...admin_examInfo
            id
            name
            startTime
            endTime
            duration
          }
        }
        `}
      variables={{
        examRailsId: Number(examId),
      }}
      render={({ error, props }) => {
        if (error) {
          return <p>Error</p>;
        }
        if (!props) {
          return <p>Loading...</p>;
        }
        return (
          <DocumentTitle title={props.exam.name}>
            <Loaded
              exam={props.exam}
              refresh={() => undefined}
              examID={props.exam.id}
              response={{
                name: props.exam.name,
                start: DateTime.fromISO(props.exam.startTime),
                end: DateTime.fromISO(props.exam.endTime),
                duration: props.exam.duration,
                versions: [],
                checklist: {
                  rooms: {
                    reason: 'TODO',
                    status: ChecklistItemStatus.NotStarted,
                  },
                  staff: {
                    reason: 'TODO',
                    status: ChecklistItemStatus.NotStarted,
                  },
                  seating: {
                    reason: 'TODO',
                    status: ChecklistItemStatus.NotStarted,
                  },
                  versions: {
                    reason: 'TODO',
                    status: ChecklistItemStatus.NotStarted,
                  },
                },
              }}
            />
          </DocumentTitle>
        );
      }}
    />
  );
};

export default ExamAdmin;
