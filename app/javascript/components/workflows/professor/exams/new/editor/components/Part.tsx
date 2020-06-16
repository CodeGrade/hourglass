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
import CustomEditor from '@professor/exams/new/editor/components/CustomEditor';
import {
  Field,
  WrappedFieldProps,
  FormSection,
  FieldArray,
} from 'redux-form';
import FilePickerSelect from '@professor/exams/new/editor/components/FilePicker';
import { VeryControlledFileViewer } from '@student/exams/show/components/FileViewer';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { getFilesForRefs } from '@student/exams/show/files';
import { ExamContext } from '@hourglass/workflows/student/exams/show/context';
import MoveItem from '@professor/exams/new/editor/components/MoveItem';
import ShowBodyItems from '@professor/exams/new/editor/components/ShowBodyItems';

const PartName: React.FC<WrappedFieldProps> = (props) => {
  const {
    input,
  } = props;
  const {
    value,
    onChange,
  } = input;
  return (
    <>
      <Form.Label column sm="2">Part name</Form.Label>
      <Col sm="10">
        <CustomEditor
          className="bg-white"
          value={value.value}
          placeholder="Give a short (optional) descriptive name for the part"
          onChange={(newName, _delta, source, _editor): void => {
            if (source === 'user') {
              onChange({
                type: 'HTML',
                value: newName,
              });
            }
          }}
        />
      </Col>
    </>
  );
};

const PartDesc: React.FC<WrappedFieldProps> = (props) => {
  const { input } = props;
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
          placeholder="Give a longer description of the part"
          onChange={(newDesc, _delta, source, _editor): void => {
            if (source === 'user') {
              onChange({
                type: 'HTML',
                value: newDesc,
              });
            }
          }}
        />
      </Col>
    </>
  );
};

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
  const [open, setOpen] = useState(false);
  const noFiles = value.length === 0;
  const { files, fmap } = useContext(ExamContext);
  const filteredFiles = getFilesForRefs(fmap, value);
  return (
    <>
      <Form.Label column sm="2">Files to be shown for this question part:</Form.Label>
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
              {open && !noFiles ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
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
        <FormSection name={memberName}>
          <Card.Title>
            {`Part ${alphabetIdx(pnum)}`}
          </Card.Title>
          <Card.Subtitle>
            <Form.Group as={Row} controlId={`${qnum}-${pnum}-name`}>
              <Field name="name" component={PartName} />
            </Form.Group>
            <Form.Group as={Row} controlId={`${qnum}-${pnum}-desc`}>
              <Field name="description" component={PartDesc} />
            </Form.Group>
            <Form.Group as={Row} controlId={`${qnum}-${pnum}-points`}>
              <Field name="points" component={PartPoints} />
            </Form.Group>
            <Form.Group as={Row} controlId={`${qnum}-${pnum}-files`}>
              <Field name="reference" component={PartReference} />
            </Form.Group>
          </Card.Subtitle>
        </FormSection>
      </Alert>
      <Card.Body>
        <FieldArray name="body" component={ShowBodyItems} props={{ qnum, pnum }} />
      </Card.Body>
    </Card>
  );
};

export default Part;
