import React, { useContext, useState } from 'react';
import {
  Form,
  Card,
  Alert,
  Row,
  Col,
  InputGroup,
  Collapse,
  Button,
} from 'react-bootstrap';
import YesNo from '@student/exams/show/components/questions/YesNo';
import MoveItem from '@professor/exams/new/editor/components/MoveItem';
import ShowParts from '@professor/exams/new/editor/components/ShowParts';
import CustomEditor from '@professor/exams/new/editor/components/CustomEditor';
import FilePickerSelect from '@professor/exams/new/editor/components/FilePicker';
import { VeryControlledFileViewer } from '@student/exams/show/components/FileViewer';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { WrappedFieldProps, Field } from 'redux-form';
import { FileRef } from '@hourglass/workflows/student/exams/show/types';
import { ExamContext, QuestionFilesContext } from '@hourglass/workflows/student/exams/show/context';
import { getFilesForRefs } from '@hourglass/workflows/student/exams/show/files';
import { connect } from 'react-redux';
import { formSelector } from '..';

const QuestionName: React.FC<WrappedFieldProps> = (props) => {
  const {
    input,
  } = props;
  const {
    value,
    onChange,
  } = input;
  return (
    <>
      <Form.Label column sm="2">Question name</Form.Label>
      <Col sm="10">
        <CustomEditor
          className="bg-white"
          value={value.value}
          placeholder="Give a short (optional) descriptive name for the question"
          onChange={(newName, _delta, source, _editor): void => {
            if (source === 'user') {
              onChange({ type: 'HTML', value: newName });
            }
          }}
        />
      </Col>
    </>
  );
};

const QuestionDesc: React.FC<WrappedFieldProps> = (props) => {
  const {
    input,
  } = props;
  const {
    value,
    onChange,
  } = input;
  return (
    <>
      <Form.Label column sm="2">Description:</Form.Label>
      <Col sm="10">
        <CustomEditor
          className="bg-white"
          value={value.value}
          placeholder="Give a longer description of the question"
          onChange={(newDesc, _delta, source, _editor): void => {
            if (source === 'user') {
              onChange({ type: 'HTML', value: newDesc });
            }
          }}
        />
      </Col>
    </>
  );
};

const QuestionSepSubParts: React.FC<WrappedFieldProps> = (props) => {
  const {
    input,
  } = props;
  const {
    value,
    onChange,
  } = input;
  return (
    <>
      <Form.Label column sm="2">Separate subparts?</Form.Label>
      <Col sm="10">
        <YesNo
          className="bg-white rounded"
          value={!!value}
          info={{
            type: 'YesNo',
            prompt: {
              type: 'HTML',
              value: '',
            },
          }}
          onChange={(newVal): void => {
            onChange(newVal);
          }}
        />
      </Col>
    </>
  );
};

const QuestionReference: React.FC<WrappedFieldProps> = (props) => {
  const {
    input,
  } = props;
  const {
    value,
    onChange,
  }: {
    value: FileRef[];
    onChange: (newVal: FileRef[]) => void;
  } = input;
  const [open, setOpen] = useState(false);
  const noFiles = value.length === 0;
  const { files, fmap } = useContext(ExamContext);
  const filteredFiles = getFilesForRefs(fmap, value);
  return (
    <>
      <Form.Label column sm="2">Files to be shown for this question:</Form.Label>
      <Col sm={10}>
        <InputGroup>
          <div className="flex-grow-1">
            <FilePickerSelect options={files} selected={value} onChange={onChange} />
          </div>
          <InputGroup.Append>
            <Button
              variant="info"
              disabled={noFiles}
              onClick={(): void => setOpen((o) => !o)}
            >
              Preview files
              {open && !files ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
            </Button>
          </InputGroup.Append>
        </InputGroup>
        <Collapse in={open && !noFiles}>
          <div className="border">
            <VeryControlledFileViewer files={filteredFiles} />
          </div>
        </Collapse>
      </Col>
    </>
  );
};

const QuestionFilesProvider: React.FC<{
  reference: FileRef[];
}> = (props) => {
  const {
    reference,
    children,
  } = props;
  return (
    <QuestionFilesContext.Provider
      value={{
        references: reference,
      }}
    >
      {children}
    </QuestionFilesContext.Provider>
  );
};

const Question: React.FC<{
  memberName: string;
  qnum: number;
}> = (props) => {
  const {
    memberName,
    qnum,
  } = props;
  const [moversVisible, setMoversVisible] = useState(false);
  const ReferenceProvider = connect((state) => ({
    reference: formSelector(state, `${memberName}.reference`),
  }))(QuestionFilesProvider);
  return (
    <Card
      className="mb-3"
      border="primary"
      onMouseOver={(): void => setMoversVisible(true)}
      onFocus={(): void => setMoversVisible(true)}
      onBlur={(): void => setMoversVisible(false)}
      onMouseOut={(): void => setMoversVisible(false)}
    >
      <MoveItem
        visible={moversVisible}
        variant="primary"
        enableUp={qnum > 0}
        // enableDown={qnum + 1 < numQuestions}
        enableDown={false}
        onUp={(): void => {
          // TODO
        }}
        onDown={(): void => {
          // TODO
        }}
        onDelete={(): void => {
          // TODO
        }}
        // onUp={(): MoveQuestionAction => moveQuestion(qnum, qnum - 1)}
        // onDown={(): MoveQuestionAction => moveQuestion(qnum, qnum + 1)}
        // onDelete={(): DeleteQuestionAction => deleteQuestion(qnum)}
      />
      <Alert variant="primary">
        <Card.Title>
          {`Question ${qnum + 1}`}
        </Card.Title>
        <Card.Subtitle>
          <Form.Group as={Row} controlId={`${qnum}-name`}>
            <Field name={`${memberName}.name`} component={QuestionName} />
          </Form.Group>
          <Form.Group as={Row} controlId={`${qnum}-desc`}>
            <Field name={`${memberName}.description`} component={QuestionDesc} />
          </Form.Group>
          <Form.Group as={Row} controlId={`${qnum}-separate`}>
            <Field name={`${memberName}.seperateSubparts`} component={QuestionSepSubParts} />
          </Form.Group>
          <Form.Group as={Row} controlId={`${qnum}-files`}>
            <Field name={`${memberName}.reference`} component={QuestionReference} />
          </Form.Group>
        </Card.Subtitle>
        <Card.Body>
          <ReferenceProvider>
            TODO
            {/* <ShowParts qnum={qnum} /> */}
          </ReferenceProvider>
        </Card.Body>
      </Alert>
    </Card>
  );
};

export default Question;
