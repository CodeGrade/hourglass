import React, { useState, useMemo } from 'react';
import {
  Form,
  Card,
  Row,
  Col,
} from 'react-bootstrap';
import { alphabetIdx } from '@hourglass/common/helpers';
import {
  Field,
  WrappedFieldProps,
  FormSection,
  FieldArray,
} from 'redux-form';
import { PartFilesContext } from '@hourglass/common/context';
import { NumericInput } from '@hourglass/common/NumericInput';
import MoveItem from '@professor/exams/new/editor/components/MoveItem';
import ShowBodyItems from '@professor/exams/new/editor/components/ShowBodyItems';
import RubricEditor from '@professor/exams/new/editor/RubricEditor';
import YesNo from '@student/exams/show/components/questions/YesNo';
import { YesNoInfo } from '@student/exams/show/types';
import { EditHTMLField } from './editHTMLs';
import EditReference from './Reference';

const PartPoints: React.FC<WrappedFieldProps> = (props) => {
  const { input } = props;
  const {
    value,
    onChange,
  } = input;
  return (
    <>
      <Form.Label column sm="2">Points</Form.Label>
      <Col sm="4">
        <NumericInput
          value={value}
          placeholder="Points for this part"
          variant="success"
          min={0}
          max={100}
          step={0.5}
          onChange={onChange}
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

const EC_YESNO: YesNoInfo = {
  type: 'YesNo',
  yesLabel: 'Yes',
  noLabel: 'No',
  prompt: {
    type: 'HTML',
    value: '',
  },
};
const PartExtraCredit: React.FC<WrappedFieldProps> = (props) => {
  const {
    input,
  } = props;
  const {
    value,
    onChange,
  } = input;
  return (
    <>
      <Form.Label column sm="2">Extra credit?</Form.Label>
      <Col sm="4">
        <YesNo
          variant="success"
          className="bg-white rounded"
          value={!!value}
          info={EC_YESNO}
          onChange={onChange}
        />
      </Col>
    </>
  );
};

const PartReferenceProvider: React.FC<WrappedFieldProps> = (props) => {
  const { input, children } = props;
  const { value: references } = input;
  const val = useMemo(() => ({ references }), [references]);
  return (
    <PartFilesContext.Provider value={val}>
      {children}
    </PartFilesContext.Provider>
  );
};

const Part: React.FC<{
  memberName: string;
  examVersionId: string;
  qnum: number;
  pnum: number;
  enableDown: boolean;
  moveDown: () => void;
  moveUp: () => void;
  remove: () => void;
}> = (props) => {
  const {
    memberName,
    examVersionId,
    qnum,
    pnum,
    enableDown,
    moveDown,
    moveUp,
    remove,
  } = props;
  const [moversVisible, setMoversVisible] = useState(false);
  const showMovers = (): void => setMoversVisible(true);
  const hideMovers = (): void => setMoversVisible(false);
  return (
    <Card
      className="mb-3"
      border="success"
      onMouseOver={showMovers}
      onFocus={showMovers}
      onBlur={hideMovers}
      onMouseOut={hideMovers}
    >
      <MoveItem
        visible={moversVisible}
        variant="success"
        enableUp={pnum > 0}
        enableDown={enableDown}
        enableDelete
        disabledDeleteMessage=""
        onUp={moveUp}
        onDown={moveDown}
        onDelete={remove}
      />
      <FormSection name={memberName}>
        <div className="alert alert-success">
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
              <Field name="extraCredit" component={PartExtraCredit} />
            </Form.Group>
            <Form.Group as={Row} controlId={`${qnum}-${pnum}-files`}>
              <Field
                name="reference"
                component={EditReference}
                label="this question part"
              />
            </Form.Group>
          </Card.Subtitle>
        </div>
        <Card.Body>
          <Field
            name="partRubric"
            fieldName="partRubric"
            component={RubricEditor}
            format={null}
            enableDelete={false}
            disabledDeleteMessage="Cannot delete root rubric"
          />
          <Field
            name="reference"
            component={PartReferenceProvider}
          >
            <FieldArray
              name="body"
              component={ShowBodyItems}
              qnum={qnum}
              pnum={pnum}
              examVersionId={examVersionId}
            />
          </Field>
        </Card.Body>
      </FormSection>
    </Card>
  );
};

export default Part;
