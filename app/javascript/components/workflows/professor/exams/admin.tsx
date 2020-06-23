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
  Link,
  useParams,
  useHistory,
  Redirect,
  useLocation,
} from 'react-router-dom';
import {
  useResponse as examsShow,
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
  Tabs,
  Tab,
  Nav,
  Container,
} from 'react-bootstrap';
import {
  FaChevronUp,
  FaChevronDown,
  FaCheck,
  FaTimes,
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
import {
  ExamUpdateInfo,
  updateExam,
} from '@hourglass/common/api/professor/exams/update';
import { DateTime } from 'luxon';
import { importVersion } from '@hourglass/common/api/professor/exams/versions/import';
import { MdWarning, MdDoNotDisturb } from 'react-icons/md';
import Tooltip from '@hourglass/workflows/student/exams/show/components/Tooltip';
import EditExamRooms from '@professor/exams/rooms';
import AssignSeating from '@hourglass/common/student-dnd';
import AllocateVersions from '@professor/exams/allocate-versions';
import AssignStaff from '@professor/exams/assign-staff';
import ErrorBoundary from '@hourglass/common/boundary';
import { BsPencilSquare } from 'react-icons/bs';
import { GiOpenBook } from 'react-icons/gi';

export const ExamAdmin: React.FC = () => {
  const { examId } = useParams();
  const [refresher, refresh] = useRefresher();
  const response = examsShow(examId, [refresher]);
  switch (response.type) {
    case 'ERROR':
      return (
        <span
          className="text-danger"
        >
          {response.text}
        </span>
      );
    case 'LOADING':
      return <p>Loading...</p>;
    case 'RESULT':
      return (
        <Loaded
          refresh={refresh}
          response={response.response}
        />
      );
    default:
      throw new ExhaustiveSwitchError(response);
  }
};

const Loaded: React.FC<{
  refresh: () => void;
  response: ShowResponse;
}> = (props) => {
  const {
    refresh,
    response,
  } = props;
  const { examId } = useParams();
  const history = useHistory();
  const { alert } = useContext(AlertContext);
  const [editing, setEditing] = useState(false);
  const flipEditing = useCallback(() => setEditing((e) => !e), []);
  return (
    <>
      {editing ? (
        <ExamInfoEditor
          response={response}
          onCancel={flipEditing}
          onSubmit={(info) => {
            updateExam(examId, info)
              .then((res) => {
                if (res.updated === true) {
                  setEditing(false);
                  alert({
                    variant: 'success',
                    message: 'Exam info saved.',
                  });
                  refresh();
                } else {
                  throw new Error(res.reason);
                }
              }).catch((err) => {
                alert({
                  variant: 'danger',
                  title: 'Error saving exam info.',
                  message: err.message,
                });
              });
          }}
        />
      ) : (
        <ExamInfoViewer
          onEdit={flipEditing}
          response={response}
        />
      )}
      <TabbedChecklist
        refresh={refresh}
        examId={examId}
        checklist={response.checklist}
        versions={response.versions}
        examName={response.name}
      />
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
      <h2>Pre-flight Checklist</h2>
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
        </Nav>
        <Tab.Content className="border border-top-0 rounded-bottom p-2">
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
    examId,
  } = useParams();
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
    <>
      <h1>{response.name}</h1>
      <p>
        Starts&nbsp;
        <ReadableDate value={start} showTime />
      </p>
      <p>
        Ends&nbsp;
        <ReadableDate value={end} showTime />
      </p>
      <p>{`Duration: ${duration / 60.0} minutes`}</p>
      <Button
        variant="primary"
        onClick={onEdit}
      >
        Edit
      </Button>
    </>
  );
};

const NINETY_MINUTES = 5400;

export const ExamInfoEditor: React.FC<{
  response?: ShowResponse;
  onSubmit: (info: ExamUpdateInfo) => void;
  onCancel: () => void;
}> = (props) => {
  const {
    response,
    onSubmit,
    onCancel,
  } = props;
  const now = DateTime.local().toISO();
  const threeHours = DateTime.local().plus({ hours: 3 }).toISO();
  const [name, setName] = useState(response?.name ?? '');
  const [start, setStart] = useState(response?.start.toISO() ?? now);
  const [end, setEnd] = useState(response?.end.toISO() ?? threeHours);
  const [duration, setDuration] = useState(response?.duration ?? NINETY_MINUTES);

  return (
    <Card>
      <Card.Body>
        <Form.Group as={Row} controlId="examTitle">
          <Form.Label column sm={2}>Exam name:</Form.Label>
          <Col sm={10}>
            <Form.Control
              type="input"
              value={name}
              onChange={(e): void => setName(e.target.value)}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="examStartTime">
          <Form.Label column sm={2}>Start time:</Form.Label>
          <Col sm={10}>
            <p>{start}</p>
            <DateTimePicker
              maxIsoValue={end}
              isoValue={start}
              onChange={(newStart): void => {
                // console.log(start, newStart.toISO());
                setStart(newStart.toISO());
              }}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="examEndTime">
          <Form.Label column sm={2}>End time:</Form.Label>
          <Col sm={10}>
            <p>{end}</p>
            <DateTimePicker
              isoValue={end}
              minIsoValue={start}
              onChange={(newEnd): void => setEnd(newEnd.toISO())}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="examDuration">
          <Form.Label column sm={2}>Duration (minutes):</Form.Label>
          <Col sm={10}>
            <Form.Control
              type="number"
              value={duration / 60.0}
              onChange={(e): void => setDuration(Number(e.target.value) * 60)}
            />
          </Col>
        </Form.Group>
        <Form.Group className="float-right">
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
                start,
                end,
              });
            }}
          >
            Save
          </Button>
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
      <h1>
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
      </h1>
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

export default ExamAdmin;

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
