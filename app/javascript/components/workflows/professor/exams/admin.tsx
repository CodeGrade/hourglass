import React, { useState, useEffect } from 'react';
import { Switch, Route, Link, useParams } from 'react-router-dom';
import { useResponse as examsShow, Response as ShowResponse, Version } from '@hourglass/common/api/professor/exams/show';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import {
  Card,
  Collapse,
  Button,
  InputGroup,
  ButtonGroup,
  Form,
  Row,
  Col,
} from 'react-bootstrap';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import Icon from '@student/exams/show/components/Icon';
import ExamViewer from '@proctor/registrations/show';
import { RailsExam, ContentsState } from '@student/exams/show/types';
import { Editor as CodeMirrorEditor } from 'codemirror';
import LinkButton from '@hourglass/common/linkbutton';
import ReadableDate from '@hourglass/common/ReadableDate';

export const ExamAdmin: React.FC<{}> = () => {
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
        <Loaded response={res.response} examId={examId} />
      );
    default:
      throw new ExhaustiveSwitchError(res);
  }
};

const Loaded: React.FC<{
  response: ShowResponse;
  examId: number;
}> = (props) => {
  const {
    response,
    examId,
  } = props;
  return (
    <>
      <h1>{response.name}</h1>
      <Switch>
        <Route path="/exams/:examId/admin/edit">
          <ExamInfoEditor response={response} />
        </Route>
        <Route path="/exams/:examId/admin">
          <ExamInfoViewer response={response} />
        </Route>
      </Switch>
      <VersionInfo versions={response.versions} examName={response.name} />
      <ProctoringInfo examId={examId} />
    </>
  );
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
        <Link to={`/exams/${examId}/seating`}>
          <Button
            variant="info"
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
      <p>
        Starts&nbsp;
        <ReadableDate value={start} showTime />
      </p>
      <p>
        Ends&nbsp;
        <ReadableDate value={end} showTime />
      </p>
      <p>{`Duration: ${duration} minutes`}</p>
      <LinkButton to={`/exams/${examId}/admin/edit`}>
        Edit
      </LinkButton>
    </>
  );
};


export const ExamInfoEditor: React.FC<{
  response: ShowResponse;
}> = (props) => {
  const {
    response,
  } = props;
  return (
    <Card>
      <Card.Body>
        <Form.Group as={Row} controlId="examTitle">
          <Form.Label column sm={2}>Exam name:</Form.Label>
          <Col sm={10}>
            <Form.Control type="input" defaultValue={response.name} />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="examStartTime">
          <Form.Label column sm={2}>Start time:</Form.Label>
          <Col sm={10}>
            <Form.Control type="input" defaultValue={response.start.toISO()} />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="examEndTime">
          <Form.Label column sm={2}>Start time:</Form.Label>
          <Col sm={10}>
            <Form.Control type="input" defaultValue={response.end.toISO()} />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="examDuration">
          <Form.Label column sm={2}>Duration (minutes):</Form.Label>
          <Col sm={10}>
            <Form.Control type="number" defaultValue={response.duration} />
          </Col>
        </Form.Group>
      </Card.Body>
    </Card>
  );
};

const VersionInfo: React.FC<{
  examName: string;
  versions: Version[];
}> = (props) => {
  const {
    examName,
    versions,
  } = props;
  return (
    <>
      <h2>Versions</h2>
      <ul>
        {versions.map((v) => (
          <li key={v.id}>
            <ShowVersion
              version={v}
              examName={examName}
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
}> = (props) => {
  const {
    version,
    examName,
  } = props;
  const { examId } = useParams();
  const [preview, setPreview] = useState(false);
  return (
    <>
      <InputGroup>
        <h3 className="flex-grow-1">{version.name}</h3>
        <InputGroup.Append>
          <ButtonGroup>
            <Button
              variant="info"
            >
              Grade
            </Button>
            <LinkButton
              variant="info"
              to={`/exams/${examId}/versions/${version.id}/edit`}
            >
              Edit
            </LinkButton>
            <Button
              variant="primary"
              onClick={(): void => setPreview((o) => !o)}
            >
              Preview Version
              {preview ? <Icon I={FaChevronUp} /> : <Icon I={FaChevronDown} />}
            </Button>
          </ButtonGroup>
        </InputGroup.Append>
      </InputGroup>
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
  railsExam: RailsExam;
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
