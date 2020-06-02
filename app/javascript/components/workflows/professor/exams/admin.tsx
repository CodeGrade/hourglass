import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useResponse as examsShow } from '@hourglass/common/api/professor/exams/show';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import { Collapse, Button, Form, InputGroup } from 'react-bootstrap';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import Icon from '@student/exams/show/components/Icon';
import ExamViewer from '@proctor/registrations/show';
import { RailsExam, ContentsState } from '@student/exams/show/types';
import { Editor as CodeMirrorEditor } from 'codemirror';

const ExamAdmin: React.FC<{}> = () => {
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
        <>
          <h1>{res.response.name}</h1>
          <h2>Versions</h2>
          <ul>
            {res.response.versions.map((v) => (
              <li key={v.id}>
                <ShowVersion
                  version={v}
                  examName={res.response.name}
                />
              </li>
            ))}
          </ul>
        </>
    );
    default:
      throw new ExhaustiveSwitchError(res);
  }
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
          <Button
            variant="outline-primary"
            onClick={(): void => setPreview((o) => !o)}
          >
            Preview Version
            {preview ? <Icon I={FaChevronUp} /> : <Icon I={FaChevronDown} />}
          </Button>
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
  const { examId } = useParams();
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
