import React, { useState, useEffect, useContext } from 'react';
import {
  Switch,
  Route,
  Link,
  useParams,
  useHistory,
} from 'react-router-dom';
import { useResponse as examsShow, Response as ShowResponse, Version } from '@hourglass/common/api/professor/exams/show';
import { ExhaustiveSwitchError, useRefresher } from '@hourglass/common/helpers';
import {
  Card,
  Collapse,
  Button,
  Form,
  Row,
  Col,
} from 'react-bootstrap';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import Icon from '@student/exams/show/components/Icon';
import ExamViewer from '@proctor/registrations/show';
import { RailsExamVersion, ContentsState } from '@student/exams/show/types';
import { Editor as CodeMirrorEditor } from 'codemirror';
import LinkButton from '@hourglass/common/linkbutton';
import ReadableDate from '@hourglass/common/ReadableDate';
import { hitApi } from '@hourglass/common/types/api';
import { AlertContext } from '@hourglass/common/alerts';
import DateTimePicker from '@professor/exams/new/DateTimePicker';
import createVersion from '@hourglass/common/api/professor/exams/versions/create';
import deleteVersion from '@hourglass/common/api/professor/exams/versions/delete';
import TooltipButton from '@student/exams/show/components/TooltipButton';

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
        <>
          <Switch>
            <Route path="/exams/:examId/admin/edit">
              <ExamInfoEditor
                response={response.response}
                onSuccess={refresh}
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
          <ProctoringInfo examId={examId} />
        </>
      );
    default:
      throw new ExhaustiveSwitchError(response);
  }
};

const ProctoringInfo: React.FC<{
  examId: number;
}> = (props) => {
  const {
    examId,
  } = props;
  return (
    <>
      <h2>Proctoring Arrangements</h2>
      <Form.Group>
        <Link to={`/exams/${examId}/assign-staff`}>
          <Button
            variant="info"
          >
            Assign staff members
          </Button>
        </Link>
        <Link to={`/exams/${examId}/seating`}>
          <Button
            variant="info"
            className="ml-2"
          >
            Assign seating
          </Button>
        </Link>
        <Link to={`/exams/${examId}/allocate-versions`}>
          <Button
            variant="info"
            className="ml-2"
          >
            Allocate versions
          </Button>
        </Link>
      </Form.Group>
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


export const ExamInfoEditor: React.FC<{
  response: ShowResponse;
  onSuccess: () => void;
}> = (props) => {
  const {
    response,
    onSuccess,
  } = props;
  const {
    examId,
  } = useParams();
  const history = useHistory();
  const { alert } = useContext(AlertContext);
  const [name, setName] = useState(response.name);
  const [start, setStart] = useState(response.start.toISO());
  const [end, setEnd] = useState(response.end.toISO());
  const [duration, setDuration] = useState(response.duration);

  const submitForm = (): void => {
    const formInfo = {
      exam: {
        name,
        start,
        end,
        duration,
      },
    };
    hitApi<{
      updated: boolean;
    }>(`/api/professor/exams/${examId}`, {
      method: 'PATCH',
      body: JSON.stringify(formInfo),
    }).then(({ updated }) => {
      history.push(`/exams/${examId}/admin`);
      if (updated) {
        alert({
          variant: 'success',
          message: 'Exam info saved.',
        });
        onSuccess();
      } else {
        throw new Error('API failure');
      }
    }).catch((err) => {
      history.push(`/exams/${examId}/admin`);
      alert({
        variant: 'danger',
        title: 'Error saving exam info.',
        message: err.message,
      });
    });
  };

  const cancelEditing = (): void => {
    history.push(`/exams/${examId}/admin`);
  };

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
            onClick={cancelEditing}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            className="ml-2"
            onClick={submitForm}
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
  const { examId } = useParams();
  const history = useHistory();
  return (
    <>
      <h2>
        Versions
        <Button
          variant="success"
          className="float-right"
          onClick={(): void => {
            createVersion(examId).then((res) => {
              history.push(`/exams/${examId}/versions/${res.id}/edit`);
            });
          }}
        >
          New Version
        </Button>
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
            disabledMessage="Version has started students."
            cursorClass="cursor-not-allowed"
            onClick={(): void => {
              deleteVersion(version.id).then(() => {
                refresh();
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
