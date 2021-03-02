import React, { useState, useMemo } from 'react';
import {
  Form,
  Card,
  Row,
  Col,
} from 'react-bootstrap';
import YesNo from '@student/exams/show/components/questions/YesNo';
import MoveItem from '@professor/exams/new/editor/components/MoveItem';
import ShowParts from '@professor/exams/new/editor/components/ShowParts';
import {
  WrappedFieldProps,
  Field,
  FieldArray,
  FormSection,
} from 'redux-form';
import { QuestionFilesContext } from '@hourglass/common/context';
import { EditHTMLField } from '@professor/exams/new/editor/components/editHTMLs';
import EditReference from '@professor/exams/new/editor/components/Reference';
import { YesNoInfo } from '@student/exams/show/types';

const SEP_SUB_YESNO: YesNoInfo = {
  type: 'YesNo',
  yesLabel: 'Yes',
  noLabel: 'No',
  prompt: {
    type: 'HTML',
    value: '',
  },
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
      <Col sm="4">
        <YesNo
          className="bg-white rounded"
          value={!!value}
          info={SEP_SUB_YESNO}
          onChange={onChange}
        />
      </Col>
    </>
  );
};

const QuestionExtraCredit: React.FC<WrappedFieldProps> = (props) => {
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
          className="bg-white rounded"
          value={!!value}
          info={SEP_SUB_YESNO}
          onChange={onChange}
        />
      </Col>
    </>
  );
};

const QuestionReferenceProvider: React.FC<WrappedFieldProps> = (props) => {
  const { input, children } = props;
  const { value: references } = input;
  const val = useMemo(() => ({ references }), [references]);
  return (
    <QuestionFilesContext.Provider value={val}>
      {children}
    </QuestionFilesContext.Provider>
  );
};

const Question: React.FC<{
  memberName: string;
  examVersionId: string;
  qnum: number;
  enableDown: boolean;
  moveDown: () => void;
  moveUp: () => void;
  remove: () => void;
}> = (props) => {
  const {
    memberName,
    examVersionId,
    qnum,
    enableDown,
    moveDown,
    moveUp,
    remove,
  } = props;
  const [moversVisible, setMoversVisible] = useState(false);
  const showMovers = () => setMoversVisible(true);
  const hideMovers = () => setMoversVisible(false);
  return (
    <Card
      className="mb-3"
      border="primary"
      onMouseOver={showMovers}
      onFocus={showMovers}
      onBlur={hideMovers}
      onMouseOut={hideMovers}
    >
      <MoveItem
        visible={moversVisible}
        variant="primary"
        enableUp={qnum > 0}
        enableDown={enableDown}
        enableDelete
        disabledDeleteMessage=""
        onUp={moveUp}
        onDown={moveDown}
        onDelete={remove}
      />
      <FormSection name={memberName}>
        <div className="alert alert-primary">
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
              <Field name="separateSubparts" component={QuestionSepSubParts} />
              <Field name="extraCredit" component={QuestionExtraCredit} />
            </Form.Group>
            <Form.Group as={Row} controlId={`${qnum}-files`}>
              <Field
                name="reference"
                component={EditReference}
                label="this question"
              />
            </Form.Group>
          </Card.Subtitle>
        </div>
        <Card.Body>
          <Field
            name="reference"
            component={QuestionReferenceProvider}
          >
            <FieldArray
              name="parts"
              component={ShowParts}
              qnum={qnum}
              examVersionId={examVersionId}
            />
          </Field>
        </Card.Body>
      </FormSection>
    </Card>
  );
};

export default Question;
