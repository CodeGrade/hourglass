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
import FilePickerSelect from '@professor/exams/new/editor/components/FilePicker';
import { VeryControlledFileViewer } from '@student/exams/show/components/FileViewer';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import {
  WrappedFieldProps,
  Field,
  FieldArray,
  FormSection,
} from 'redux-form';
import { FileRef } from '@hourglass/workflows/student/exams/show/types';
import { ExamContext, QuestionFilesContext } from '@hourglass/workflows/student/exams/show/context';
import { getFilesForRefs } from '@hourglass/workflows/student/exams/show/files';
import { EditHTMLField } from './editHTMLs';

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

const QuestionReferenceProvider: React.FC<WrappedFieldProps> = (props) => {
  const { input, children } = props;
  const { value: references } = input;
  return (
    <QuestionFilesContext.Provider value={{ references }}>
      {children}
    </QuestionFilesContext.Provider>
  );
};

const Question: React.FC<{
  memberName: string;
  qnum: number;
  enableDown: boolean;
  moveDown: () => void;
  moveUp: () => void;
  remove: () => void;
}> = (props) => {
  const {
    memberName,
    qnum,
    enableDown,
    moveDown,
    moveUp,
    remove,
  } = props;
  const [moversVisible, setMoversVisible] = useState(false);
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
        enableDown={enableDown}
        onUp={moveUp}
        onDown={moveDown}
        onDelete={remove}
      />
      <Alert variant="primary">
        <FormSection name={memberName}>
          <Card.Title>
            {`Question ${qnum + 1}`}
          </Card.Title>
          <Card.Subtitle>
            <Form.Group as={Row} controlId={`${qnum}-name`}>
              <Form.Label column sm="2">Question name</Form.Label>
              <Col sm="10">
                <Field
                  name="name"
                  component={EditHTMLField}
                  placeholder="Give a short (optional) descriptive name for the question"
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId={`${qnum}-desc`}>
              <Form.Label column sm="2">Description:</Form.Label>
              <Col sm="10">
                <Field
                  name="description"
                  component={EditHTMLField}
                  placeholder="Give a longer description of the question"
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId={`${qnum}-separate`}>
              <Field name="seperateSubparts" component={QuestionSepSubParts} />
            </Form.Group>
            <Form.Group as={Row} controlId={`${qnum}-files`}>
              <Field name="reference" component={QuestionReference} />
            </Form.Group>
          </Card.Subtitle>
          <Card.Body>
            <Field
              name="reference"
              component={QuestionReferenceProvider}
            >
              <FieldArray name="parts" component={ShowParts} props={{ qnum }} />
            </Field>
          </Card.Body>
        </FormSection>
      </Alert>
    </Card>
  );
};

export default Question;
