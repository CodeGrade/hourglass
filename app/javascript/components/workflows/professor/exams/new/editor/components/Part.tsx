import React, { useState, useContext } from 'react';
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
import { alphabetIdx } from '@hourglass/common/helpers';
import {
  Field,
  WrappedFieldProps,
  FormSection,
  FieldArray,
} from 'redux-form';
import FilePickerSelect, { FilePickerSelectWithPreview } from '@professor/exams/new/editor/components/FilePicker';
import { VeryControlledFileViewer } from '@student/exams/show/components/FileViewer';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { getFilesForRefs } from '@student/exams/show/files';
import { ExamContext, PartFilesContext } from '@hourglass/workflows/student/exams/show/context';
import MoveItem from '@professor/exams/new/editor/components/MoveItem';
import ShowBodyItems from '@professor/exams/new/editor/components/ShowBodyItems';
import { EditHTMLField } from './editHTMLs';

const PartPoints: React.FC<WrappedFieldProps> = (props) => {
  const { input } = props;
  const {
    value,
    onChange,
  } = input;
  return (
    <>
      <Form.Label column sm="2">Points</Form.Label>
      <Col sm="10">
        <Form.Control
          type="number"
          value={value}
          placeholder="Points for this part"
          min={0}
          max={100}
          step={0.5}
          onChange={(e): void => {
            if (e.target.value === '') {
              onChange(0);
            } else {
              const newVal = Number.parseFloat(e.target.value);
              const actual = (Number.isFinite(newVal) ? newVal : value);
              onChange(actual);
            }
          }}
        />
        {/* <NumberPicker
            placeholder="Points for this part"
            value={points}
            onChange={(newVal): void => onChange(name, description, newVal)}
            min={0}
            max={100}
            step={0.5}
            format="#.#"
            /> */}
      </Col>
    </>
  );
};

const PartReference: React.FC<WrappedFieldProps> = (props) => {
  const { input } = props;
  const {
    value,
    onChange,
  } = input;
  const { files } = useContext(ExamContext);
  return (
    <>
      <Form.Label column sm="2">Files to be shown for this question part:</Form.Label>
      <Col sm={10}>
        <FilePickerSelectWithPreview
          options={files}
          selected={value}
          onChange={onChange}
        />
      </Col>
    </>
  );
};

const PartReferenceProvider: React.FC<WrappedFieldProps> = (props) => {
  const { input, children } = props;
  const { value: references } = input;
  return (
    <PartFilesContext.Provider value={{ references }}>
      {children}
    </PartFilesContext.Provider>
  );
};

const Part: React.FC<{
  memberName: string;
  qnum: number;
  pnum: number;
  enableDown: boolean;
  moveDown: () => void;
  moveUp: () => void;
  remove: () => void;
}> = (props) => {
  const {
    memberName,
    qnum,
    pnum,
    enableDown,
    moveDown,
    moveUp,
    remove,
  } = props;
  const [moversVisible, setMoversVisible] = useState(false);
  return (
    <Card
      className="mb-3"
      border="success"
      onMouseOver={(): void => setMoversVisible(true)}
      onFocus={(): void => setMoversVisible(true)}
      onBlur={(): void => setMoversVisible(false)}
      onMouseOut={(): void => setMoversVisible(false)}
    >
      <FormSection name={memberName}>
        <MoveItem
          visible={moversVisible}
          variant="success"
          enableUp={pnum > 0}
          enableDown={enableDown}
          onUp={moveUp}
          onDown={moveDown}
          onDelete={remove}
        />
        <Alert variant="success">
          <Card.Title>
            {`Part ${alphabetIdx(pnum)}`}
          </Card.Title>
          <Card.Subtitle>
            <Form.Group as={Row} controlId={`${qnum}-${pnum}-name`}>
              <Form.Label column sm="2">Part name</Form.Label>
              <Col sm="10">
                <Field
                  name="name"
                  component={EditHTMLField}
                  placeholder="Give a short (optional) descriptive name for the part"
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId={`${qnum}-${pnum}-desc`}>
              <Form.Label column sm="2">Description:</Form.Label>
              <Col sm="10">
                <Field
                  name="description"
                  component={EditHTMLField}
                  placeholder="Give a longer description of the part"
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId={`${qnum}-${pnum}-points`}>
              <Field name="points" component={PartPoints} />
            </Form.Group>
            <Form.Group as={Row} controlId={`${qnum}-${pnum}-files`}>
              <Field name="reference" component={PartReference} />
            </Form.Group>
          </Card.Subtitle>
        </Alert>
        <Card.Body>
          <Field
            name="reference"
            component={PartReferenceProvider}
          >
            <FieldArray name="body" component={ShowBodyItems} props={{ qnum, pnum }} />
          </Field>
        </Card.Body>
      </FormSection>
    </Card>
  );
};

export default Part;
