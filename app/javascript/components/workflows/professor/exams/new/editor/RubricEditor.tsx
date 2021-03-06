import React, { useState, useCallback } from 'react';
import {
  Form,
  Row,
  Col,
  ButtonGroup,
  ToggleButton,
  Dropdown,
  DropdownButton,
  Button,
  Card,
} from 'react-bootstrap';
import {
  FormSection,
  Field,
  FieldArray,
  WrappedFieldArrayProps,
  WrappedFieldProps,
} from 'redux-form';
import Select from 'react-select';
import ErrorBoundary from '@hourglass/common/boundary';
import {
  Rubric,
  isRubricPresets,
  isEditableRubricPresets,
  RubricPresets,
  EditableRubricPresets,
} from '@professor/exams/types';
import Tooltip from '@student/exams/show/components/Tooltip';
import MoveItem from '@professor/exams/new/editor/components/MoveItem';
import { EditHTMLField } from '@professor/exams/new/editor/components/editHTMLs';
import { ExhaustiveSwitchError, SelectOption, SelectOptions } from '@hourglass/common/helpers';
import { normalizeNumber, NumericInputField } from '@hourglass/common/NumericInput';
import '@professor/exams/rubrics.scss';

const RubricPresetEditor: React.FC<{
  enableUp: boolean;
  enableDown: boolean;
  enableDelete: boolean;
  disabledDeleteMessage?: string;
  moveDown: () => void;
  moveUp: () => void;
  remove: () => void;
}> = (props) => {
  const {
    enableUp,
    enableDown,
    enableDelete,
    disabledDeleteMessage,
    moveDown,
    moveUp,
    remove,
  } = props;
  const [moversVisible, setMoversVisible] = useState(false);
  const showMovers = (): void => setMoversVisible(true);
  const hideMovers = (): void => setMoversVisible(false);
  return (
    <Card
      className="mb-3 alert-warning p-0"
      border="warning"
      onMouseOver={showMovers}
      onFocus={showMovers}
      onBlur={hideMovers}
      onMouseOut={hideMovers}
    >
      <MoveItem
        visible={moversVisible}
        variant="warning"
        enableUp={enableUp}
        enableDown={enableDown}
        enableDelete={enableDelete}
        disabledDeleteMessage={disabledDeleteMessage}
        onUp={moveUp}
        onDown={moveDown}
        onDelete={remove}
      />
      <Card.Body>
        <Field name="railsId" component="input" type="hidden" />
        <Form.Group as={Row}>
          <Form.Label column sm="2">Label</Form.Label>
          <Col sm="4">
            <Field name="label" component="input" type="text" className="w-100" />
          </Col>
          <Form.Label column sm="2">Points</Form.Label>
          <Col sm="4">
            <Field
              name="points"
              component={NumericInputField}
              className="w-100"
              variant="warning"
              step={0.5}
              normalize={normalizeNumber}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row}>
          <Form.Label column sm="2">Grader hint</Form.Label>
          <Col sm="10">
            <Field
              className="bg-white border rounded w-100"
              name="graderHint"
              component="input"
              placeholder="Give a description to graders to use"
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row}>
          <Form.Label column sm="2">Student feedback</Form.Label>
          <Col sm="10">
            <Field
              className="bg-white border rounded w-100"
              name="studentFeedback"
              component="input"
              placeholder="Give a default message to students -- if blank, will use the grader hint"
            />
          </Col>
        </Form.Group>
      </Card.Body>
    </Card>
  );
};

const RubricPresetsArrayEditor: React.FC<
  WrappedFieldArrayProps<RubricPresets['presets'][number]>
> = (props) => {
  const { fields } = props;
  return (
    <>
      {fields.map((member, index) => {
        const moveUp = () => fields.move(index, index - 1);
        const moveDown = () => fields.move(index, index + 1);
        const remove = () => fields.remove(index);
        const preset = fields.get(index);
        return (
          <FormSection
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            name={member}
          >
            <RubricPresetEditor
              enableUp={index > 0}
              enableDown={index + 1 < fields.length}
              enableDelete={!preset.inUse}
              disabledDeleteMessage="Can't delete presets that are in use"
              moveDown={moveDown}
              moveUp={moveUp}
              remove={remove}
            />
          </FormSection>
        );
      })}
      <Row className="text-center">
        <Col>
          <Button
            variant="warning"
            onClick={(): void => {
              fields.push({
                points: 0,
                graderHint: '',
              });
            }}
          >
            Add new preset
          </Button>
        </Col>
      </Row>
    </>
  );
};
interface RubricPresetsDirectionProps {
  value: RubricPresets['direction'];
  onChange: (newval: RubricPresets['direction']) => void;
}
const RubricPresetDirectionEditor: React.FC<
  WrappedFieldProps & RubricPresetsDirectionProps
> = (props) => {
  const { input } = props;
  const { value, onChange } = input;
  const values: {
    name: string;
    value: RubricPresets['direction'];
    message: string;
  }[] = [
    { name: 'Credit', value: 'credit', message: 'Grade counts up from zero' },
    { name: 'Deduction', value: 'deduction', message: 'Grade counts down from this section of points' },
  ];
  return (
    <ButtonGroup toggle>
      {values.map((val) => {
        const checked = (value === val.value);
        return (
          <Tooltip
            key={val.value}
            message={val.message}
          >
            <ToggleButton
              type="radio"
              variant={checked ? 'secondary' : 'outline-secondary'}
              className={checked ? '' : 'bg-white text-dark'}
              name="radio"
              value={val.value}
              checked={checked}
              onChange={(e) => onChange(e.currentTarget.value as RubricPresets['direction'])}
            >
              {val.name}
            </ToggleButton>
          </Tooltip>
        );
      })}
    </ButtonGroup>
  );
};
interface RubricPresetsProps {
  type: Rubric['type'];
  value: EditableRubricPresets;
}

const RubricPresetsEditor: React.FC<WrappedFieldProps & RubricPresetsProps> = (props) => {
  const { input, type } = props;
  const { value } = input;
  const showPoints = (type === 'any' || type === 'one');
  return (
    <>
      <Form.Group as={Row}>
        <Field name="choices.railsId" component="input" type="hidden" />
        <Form.Label column sm="1">Label</Form.Label>
        <Col sm="3">
          <Field name="label" component="input" type="text" className="w-100" />
        </Col>
        {showPoints && (
          <>
            <Form.Label column sm="2">Direction</Form.Label>
            <Col sm="3">
              <Field name="choices.direction" component={RubricPresetDirectionEditor} />
            </Col>
            <Form.Label column sm="1">Points</Form.Label>
            <Col sm="2">
              <Field
                name="points" // NOTE: Not choices.points
                component={NumericInputField}
                className="w-100"
                min={0}
                variant="secondary"
                normalize={normalizeNumber}
              />
            </Col>
          </>
        )}
      </Form.Group>
      <FormSection name="choices">
        {/* Mercy:
        <i>{mercy}</i> */}
        <Form.Label>
          Presets
          <span className="mx-2">
            (most point values should be
            <b className="mx-1">
              {value.direction === 'credit' ? 'positive' : 'negative'}
            </b>
            in this set of presets)
          </span>
        </Form.Label>
        <FieldArray name="presets" component={RubricPresetsArrayEditor} />
      </FormSection>
    </>
  );
};

interface RubricEntriesProps {
  fieldName: string;
  type: Rubric['type'];
}

const RubricEntriesEditor: React.FC<WrappedFieldProps & RubricEntriesProps> = (props) => {
  const {
    fieldName,
    type,
    input,
  } = props;
  const { value, onChange } = input;
  const anyPresets = (isEditableRubricPresets(value) && value.presets.length > 0);
  const anySections = (value instanceof Array && value.length > 0);
  const freeChoice = !(anyPresets || anySections);
  if (freeChoice) {
    if (type === 'all') {
      return (
        <Row className="text-center">
          <Col>
            <Button
              variant="secondary"
              onClick={(): void => {
                onChange([{
                  type: 'none',
                  railsId: value?.railsId,
                }]);
              }}
            >
              Add new rubric section
            </Button>
          </Col>
        </Row>
      );
    }
    return (
      <Row className="text-center">
        <Col>
          <DropdownButton
            id={`${fieldName}-newPreset`}
            variant="secondary"
            title="Add new rubric item..."
          >
            <Dropdown.Item
              onClick={(): void => {
                onChange([{
                  type: 'none',
                  railsId: value?.railsId,
                }]);
              }}
            >
              Rubric section
            </Dropdown.Item>
            <Dropdown.Item
              onClick={(): void => {
                onChange({
                  label: '',
                  direction: 'deduction',
                  presets: [{
                    points: 0,
                    graderHint: '',
                  }],
                });
              }}
            >
              Preset comment
            </Dropdown.Item>
          </DropdownButton>
        </Col>
      </Row>
    );
  }
  if (anyPresets) {
    return <Field name="choices" type={type} component={RubricPresetsEditor} />;
  }
  return (
    <>
      {/* eslint-disable-next-line no-use-before-define */}
      <FieldArray name="choices" component={RubricsArrayEditor} />
    </>
  );
};

const defaultOptions: Record<Rubric['type'], SelectOption<Rubric['type']>> = {
  none: {
    label: 'No rubric',
    value: 'none',
  },
  all: {
    label: 'Use something from all entries',
    value: 'all',
  },
  any: {
    label: 'Use any applicable entries',
    value: 'any',
  },
  one: {
    label: 'Use exactly one entry',
    value: 'one',
  },
};
const options: SelectOptions<Rubric['type']> = Object.values(defaultOptions);

const ChangeRubricType: React.FC<{
  value: Rubric;
  onChange: (newVal: Rubric) => void;
}> = (props) => {
  const { value, onChange } = props;
  const changeRubricType = useCallback((newtype: SelectOption<Rubric['type']>) => {
    if (newtype.value === 'none') {
      onChange({ type: 'none', railsId: value?.railsId });
    } else if (newtype.value === 'all') {
      const copy = { ...value };
      if ('points' in copy) { delete copy.points; }
      onChange({
        // set defaults to blank
        choices: [],
        // preserve as much as possible
        ...copy,
        // and change the type
        type: newtype.value,
      });
    } else {
      onChange({
        // set defaults to blank
        choices: [],
        points: 0,
        // preserve as much as possible
        ...value,
        // and change the type
        type: newtype.value,
      });
    }
  }, [value, onChange]);
  const disableAllWhenPreset = (option) => {
    if (option.value !== 'all') { return false; } // only disable 'all'...
    if (value && 'choices' in value) { //  if we have any saved choices...
      if (isRubricPresets(value.choices)) { //        that are presets,...
        if (value.choices.presets.length > 0) { // and presets are present
          return true;
        }
      }
    }
    // Note: we use `choices in value` because the onChange handler
    // saves the old choices, even if it's a RubricNone
    return false;
  };
  return (
    <Form.Group as={Row}>
      <Form.Label column sm="2"><h5 className="my-0">Rubric type</h5></Form.Label>
      <Col sm="10">
        <Select
          classNamePrefix="select"
          className="z-1000-select"
          options={options}
          value={defaultOptions[value?.type || 'none']}
          isOptionDisabled={disableAllWhenPreset}
          onChange={changeRubricType}
        />
      </Col>
    </Form.Group>
  );
};

interface RubricEditorProps {
  fieldName: string;
  enableUp: boolean;
  enableDown: boolean;
  enableDelete: boolean;
  disabledDeleteMessage?: string;
  moveDown: () => void;
  moveUp: () => void;
  remove: () => void;
  input: {
    value: Rubric,
    onChange: (newval: Rubric) => void;
  };
}

const RubricEditor: React.FC<WrappedFieldProps & RubricEditorProps> = (props) => {
  const {
    input,
    fieldName = input.name,
    enableUp,
    enableDown,
    enableDelete,
    disabledDeleteMessage,
    moveDown,
    moveUp,
    remove,
  } = props;
  const {
    value: val,
    onChange,
  } = input;
  const value: Rubric = val;
  const [moversVisible, setMoversVisible] = useState(false);
  const showMovers = (): void => setMoversVisible(true);
  const hideMovers = (): void => setMoversVisible(false);
  let body;
  if (value === undefined) {
    body = <ChangeRubricType value={value} onChange={onChange} />;
  } else {
    switch (value.type) {
      case 'none': {
        const valueNone = { type: value.type, railsId: value.railsId };
        body = <ChangeRubricType value={valueNone} onChange={onChange} />;
        break;
      }
      case 'any':
      case 'one':
      case 'all':
        body = (
          <>
            <ChangeRubricType value={value} onChange={onChange} />
            <Field
              className="bg-white border rounded"
              name="description"
              component={EditHTMLField}
              theme="bubble"
              placeholder={`Give use-${value.type} rubric instructions here`}
            />
            <Field
              name="choices"
              type={value.type}
              format={null}
              component={RubricEntriesEditor}
            />
          </>
        );
        break;
      default:
        throw new ExhaustiveSwitchError(value, `name is ${fieldName}`);
    }
  }
  return (
    <Card
      className="mb-3 alert-dark rubric p-0"
      border="secondary"
      onMouseOver={showMovers}
      onMouseOut={hideMovers}
      onFocus={showMovers}
      onBlur={hideMovers}
    >
      <MoveItem
        visible={moversVisible}
        variant="secondary"
        enableUp={enableUp}
        enableDown={enableDown}
        enableDelete={enableDelete}
        disabledDeleteMessage={disabledDeleteMessage}
        onUp={moveUp}
        onDown={moveDown}
        onDelete={remove}
      />
      <FormSection name={fieldName}>
        <Card.Body>
          <ErrorBoundary>
            <Field name="railsId" component="input" type="hidden" />
            {body}
          </ErrorBoundary>
        </Card.Body>
      </FormSection>
    </Card>
  );
};

const RubricsArrayEditor: React.FC<WrappedFieldArrayProps<Rubric>> = (props) => {
  const { fields } = props;
  return (
    <>
      {fields.map((member, index) => {
        const moveUp = () => fields.move(index, index - 1);
        const moveDown = () => fields.move(index, index + 1);
        const remove = () => fields.remove(index);
        const rubric = fields.get(index);
        return (
          <Field
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            name={member}
            fieldName={member}
            enableUp={index > 0}
            enableDown={index + 1 < fields.length}
            enableDelete={!rubric.inUse}
            disabledDeleteMessage="Cannot delete rubric that is in use"
            moveDown={moveDown}
            moveUp={moveUp}
            remove={remove}
            component={RubricEditor}
          />
        );
      })}
      <Row className="text-center">
        <Col>
          <Button
            variant="secondary"
            onClick={(): void => {
              fields.push({
                type: 'none',
              });
            }}
          >
            Add new rubric section
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default RubricEditor;
