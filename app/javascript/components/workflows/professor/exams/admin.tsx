import React, {
  useState,
  useEffect,
  useContext,
  createRef,
} from 'react';
import {
  Switch,
  Route,
  Link,
  useParams,
  useHistory,
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

export const ExamAdmin: React.FC = () => {
  const { examId } = useParams();
  const [refresher, refresh] = useRefresher();
  const history = useHistory();
  const { alert } = useContext(AlertContext);
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
        <>
          <Switch>
            <Route path="/exams/:examId/admin/edit">
              <ExamInfoEditor
                response={response.response}
                onCancel={(): void => {
                  history.push(`/exams/${examId}/admin`);
                }}
                onSubmit={(info) => {
                  updateExam(examId, info)
                    .then((res) => {
                      if (res.updated === true) {
                        history.push(`/exams/${examId}/admin`);
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
            </Route>
            <Route path="/exams/:examId/admin">
              <ExamInfoViewer response={response.response} />
            </Route>
          </Switch>
          <VersionInfo
            versions={response.response.versions}
            examName={response.response.name}
            refresh={refresh}
          />
          <ProctoringInfo examId={examId} checklist={response.response.checklist} />
        </>
      );
    default:
      throw new ExhaustiveSwitchError(response);
  }
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

const ProctoringInfo: React.FC<{
  examId: number;
  checklist: Checklist;
}> = (props) => {
  const {
    examId,
    checklist,
  } = props;
  return (
    <>
      <h2>Proctoring Checklist</h2>
      <ul className="list-unstyled">
        <li>
          <ChecklistIcon
            reason={checklist.rooms.reason}
            status={checklist.rooms.status}
          />
          <Link to={`/exams/${examId}/rooms`}>
            Edit rooms
          </Link>
        </li>
        <li>
          <ChecklistIcon
            reason={checklist.staff.reason}
            status={checklist.staff.status}
          />
          <Link to={`/exams/${examId}/assign-staff`}>
            Assign staff members
          </Link>
        </li>
        <li>
          <ChecklistIcon
            reason={checklist.versions.reason}
            status={checklist.versions.status}
          />
          <Link to={`/exams/${examId}/allocate-versions`}>
            Allocate versions
          </Link>
        </li>
        <li>
          <ChecklistIcon
            reason={checklist.seating.reason}
            status={checklist.seating.status}
          />
          <Link to={`/exams/${examId}/seating`}>
            Assign seating
          </Link>
        </li>
      </ul>
    </>
  );
};

const ExamInfoViewer: React.FC<{
  response: ShowResponse;
}> = (props) => {
  const {
    examId,
  } = useParams();
  const {
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
      <LinkButton to={`/exams/${examId}/admin/edit`}>
        Edit
      </LinkButton>
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
      <PreviewVersion
        open={preview}
        railsExam={{
          id: examId,
          name: examName,
          policies: version.policies,
        }}
        contents={version.contents}
      />
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
