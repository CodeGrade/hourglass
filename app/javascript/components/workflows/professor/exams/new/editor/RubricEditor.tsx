import React, { useState, useCallback } from 'react';
import {
  Alert,
  Form,
  Row,
  Col,
  ButtonGroup,
  ToggleButton,
  Dropdown,
  DropdownButton,
  Button,
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
  RubricAll,
  RubricAny,
  RubricOne,
  isRubricPresets,
  RubricPresets,
  RubricNone,
} from '@professor/exams/types';
import Tooltip from '@student/exams/show/components/Tooltip';
import MoveItem from '@professor/exams/new/editor/components/MoveItem';
import { EditHTMLField } from '@professor/exams/new/editor/components/editHTMLs';
import { ExhaustiveSwitchError, SelectOption, SelectOptions } from '@hourglass/common/helpers';
import '@professor/exams/rubrics.scss';

type WrappedInputProps<T> = {
  value: T;
  onChange: (a: T) => void;
  fieldName: string;
}

type WrappedInput<T> = React.ComponentType<WrappedInputProps<T>>;

function wrapInput<T>(Wrappee : WrappedInput<T>): React.FC<
  WrappedFieldProps & WrappedInputProps<T>
> {
  return (props) => {
    const { fieldName, input } = props;
    return (
      <ErrorBoundary>
        <Wrappee
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...props}
          fieldName={fieldName ?? input.name}
          value={input.value}
          onChange={input.onChange}
        />
      </ErrorBoundary>
    );
  };
}


const RubricPresetEditor: React.FC<{
  enableUp: boolean;
  enableDown: boolean;
  moveDown: () => void;
  moveUp: () => void;
  remove: () => void;
}> = (props) => {
  const {
    enableUp,
    enableDown,
    moveDown,
    moveUp,
    remove,
  } = props;
  const [moversVisible, setMoversVisible] = useState(false);
  return (
    <Alert
      variant="warning"
      onMouseOver={() => setMoversVisible(true)}
      onFocus={() => setMoversVisible(true)}
      onMouseOut={() => setMoversVisible(false)}
      onBlur={() => setMoversVisible(false)}
    >
      <MoveItem
        visible={moversVisible}
        variant="warning"
        enableUp={enableUp}
        enableDown={enableDown}
        onUp={moveUp}
        onDown={moveDown}
        onDelete={remove}
      />
      <Form.Group as={Row}>
        <Form.Label column sm="2">Label</Form.Label>
        <Col sm="4">
          <Field name="label" component="input" type="text" className="w-100" />
        </Col>
        <Form.Label column sm="2">Points</Form.Label>
        <Col sm="4">
          <Field
            name="points"
            component="input"
            type="number"
            className="w-100"
            normalize={(newval) => (newval === '' ? 0 : Number.parseInt(newval, 10))}
          />
        </Col>
      </Form.Group>
      <Form.Group as={Row}>
        <Form.Label column sm="2">Grader hint</Form.Label>
        <Col sm="10">
          <Field
            className="bg-white border rounded"
            name="graderHint"
            component={EditHTMLField}
            theme="bubble"
            placeholder="Give a description to graders to use"
          />
        </Col>
      </Form.Group>
      <Form.Group as={Row}>
        <Form.Label column sm="2">Student feedback</Form.Label>
        <Col sm="10">
          <Field
            className="bg-white border rounded"
            name="studentFeedback"
            component={EditHTMLField}
            theme="bubble"
            placeholder="Give a default message to students -- if blank, will use the grader hint"
          />
        </Col>
      </Form.Group>
    </Alert>
  );
};

const RubricPresetsArrayEditor: React.FC<
  WrappedFieldArrayProps<RubricPresets['presets'][number]>
> = (props) => {
  const { fields } = props;
  return (
    <>
      {fields.map((member, index) => (
        <FormSection
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          name={member}
        >
          <RubricPresetEditor
            enableUp={index > 0}
            enableDown={index + 1 < fields.length}
            moveDown={() => fields.move(index, index + 1)}
            moveUp={() => fields.move(index, index - 1)}
            remove={() => fields.remove(index)}
          />
        </FormSection>
      ))}
      <Row className="text-center">
        <Col>
          <Button
            variant="warning"
            onClick={(): void => {
              fields.push({
                points: 0,
                graderHint: { type: 'HTML', value: '' },
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

const RubricPresetDirectionEditor: React.FC<{
  value: RubricPresets['direction'];
  onChange: (newval: RubricPresets['direction']) => void;
}> = (props) => {
  const { value, onChange } = props;
  const values = [
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
              className={checked ? '' : 'bg-white'}
              name="radio"
              value={val.value}
              checked={checked}
              onChange={(e) => onChange(e.currentTarget.value)}
            >
              {val.name}
            </ToggleButton>
          </Tooltip>
        );
      })}
    </ButtonGroup>
  );
};

const WrappedPresetDirectionEditor = wrapInput(RubricPresetDirectionEditor);

const RubricPresetsEditor: React.FC<{
  fieldName: string;
  type: Rubric['type'];
  value: RubricPresets;
  onChange: (newval: RubricPresets) => void;
}> = (props) => {
  const { type, value } = props;
  const showPoints = (type === 'any' || type === 'one');
  return (
    <FormSection name="choices">
      <Form.Group as={Row}>
        <Form.Label column sm="1">Label</Form.Label>
        <Col sm="3">
          <Field name="label" component="input" type="text" className="w-100" />
        </Col>
        {showPoints && (
          <>
            <Form.Label column sm="2">Direction</Form.Label>
            <Col sm="3">
              <Field name="direction" component={WrappedPresetDirectionEditor} />
            </Col>
            <Form.Label column sm="1">Points</Form.Label>
            <Col sm="2">
              <Field
                name="points"
                component="input"
                type="number"
                className="w-100"
                normalize={(newval) => (newval === '' ? 0 : Number.parseInt(newval, 10))}
              />
            </Col>
          </>
        )}
      </Form.Group>
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
  );
};

const WrappedRubricPresetsEditor = wrapInput(RubricPresetsEditor);

const RubricEntriesEditor: React.FC<{
  fieldName: string;
  type: Rubric['type'];
  value: Rubric[] | RubricPresets;
  onChange: (newval: Rubric[] | RubricPresets) => void;
}> = (props) => {
  const {
    fieldName,
    type,
    value,
    onChange,
  } = props;
  const anyPresets = (isRubricPresets(value) && value.presets.length > 0);
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
                    graderHint: { type: 'HTML', value: '' },
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
    return <Field name="choices" type={type} component={WrappedRubricPresetsEditor} />;
  }
  return (
    <>
      {/* eslint-disable-next-line no-use-before-define */}
      <FieldArray name="choices" component={RubricsArrayEditor} />
    </>
  );
};

const WrappedRubricEntriesEditor = wrapInput(RubricEntriesEditor);

const RubricWrapper: React.FC<{
  name: string;
  onMouseOver: () => void;
  onMouseOut: () => void;
  onFocus: () => void;
  onBlur: () => void;
}> = (props) => {
  const {
    name,
    onMouseOver,
    onMouseOut,
    onFocus,
    onBlur,
    children,
  } = props;
  return (
    <FormSection name={name}>
      <div
        className="rubric"
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <Alert variant="dark">
          {children}
        </Alert>
      </div>
    </FormSection>
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
    onChange({
      // set defaults to blank
      choices: [],
      points: 0,
      // preserve as much as possible
      ...value,
      // and change the type
      type: newtype.value,
    });
  }, [value, onChange]);
  const disableAllWhenPreset = (option) => {
    if (option.value !== 'all') { return false; } // only disable 'all'...
    if ('choices' in value) { //           if we have any saved choices...
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
          value={defaultOptions[value.type]}
          isOptionDisabled={disableAllWhenPreset}
          onChange={changeRubricType}
        />
      </Col>
    </Form.Group>
  );
};

const EditRubricNone: React.FC<{
  value: RubricNone;
  onChange: (newVal: Rubric) => void
}> = (props) => {
  const { value, onChange } = props;
  return (
    <ChangeRubricType value={value} onChange={onChange} />
  );
};

const EditRubricAll: React.FC<{
  value: RubricAll;
  onChange: (newVal: Rubric) => void
}> = (props) => {
  const { value, onChange } = props;
  return (
    <>
      <ChangeRubricType value={value} onChange={onChange} />
      <Field
        className="bg-white border rounded"
        name="description"
        component={EditHTMLField}
        theme="bubble"
        placeholder="Give use-all rubric instructions here"
      />
      <Field
        name="choices"
        type={value.type}
        format={null}
        component={WrappedRubricEntriesEditor}
      />
    </>
  );
};

const EditRubricAny: React.FC<{
  value: RubricAny;
  onChange: (newVal: Rubric) => void
}> = (props) => {
  const { value, onChange } = props;
  return (
    <>
      <ChangeRubricType value={value} onChange={onChange} />
      <Field
        className="bg-white border rounded"
        name="description"
        component={EditHTMLField}
        theme="bubble"
        placeholder="Give use-any rubric instructions here"
      />
      <Field
        name="choices"
        type={value.type}
        format={null}
        component={WrappedRubricEntriesEditor}
      />
    </>
  );
};

const EditRubricOne: React.FC<{
  value: RubricOne;
  onChange: (newVal: Rubric) => void
}> = (props) => {
  const { value, onChange } = props;
  return (
    <>
      <ChangeRubricType value={value} onChange={onChange} />
      <Field
        className="bg-white border rounded"
        name="description"
        component={EditHTMLField}
        theme="bubble"
        placeholder="Give use-one rubric instructions here"
      />
      <Field
        name="choices"
        type={value.type}
        format={null}
        component={WrappedRubricEntriesEditor}
      />
    </>
  );
};


const RubricEditor: React.FC<{
  fieldName: string;
  value: Rubric;
  onChange: (newval: Rubric) => void;
  enableMovers: boolean;
  enableUp: boolean;
  enableDown: boolean;
  moveDown: () => void;
  moveUp: () => void;
  remove: () => void;
}> = (props) => {
  const {
    fieldName,
    value,
    onChange,
    enableMovers,
    enableUp,
    enableDown,
    moveDown,
    moveUp,
    remove,
  } = props;
  const [moversVisible, setMoversVisible] = useState(false);
  let body;
  if (value === undefined) {
    body = (
      <EditRubricNone
        onChange={onChange}
        value={{ type: 'none' }}
      />
    );
  } else {
    switch (value.type) {
      case 'none': body = <EditRubricNone onChange={onChange} value={value} />; break;
      case 'any': body = <EditRubricAny onChange={onChange} value={value} />; break;
      case 'one': body = <EditRubricOne onChange={onChange} value={value} />; break;
      case 'all': body = <EditRubricAll onChange={onChange} value={value} />; break;
      default:
        throw new ExhaustiveSwitchError(value, `name is ${fieldName}`);
    }
  }
  return (
    <RubricWrapper
      name={fieldName}
      onMouseOver={() => setMoversVisible(true)}
      onFocus={() => setMoversVisible(true)}
      onMouseOut={() => setMoversVisible(false)}
      onBlur={() => setMoversVisible(false)}
    >
      {enableMovers && (
        <MoveItem
          visible={moversVisible}
          variant="secondary"
          enableUp={enableUp}
          enableDown={enableDown}
          onUp={moveUp}
          onDown={moveDown}
          onDelete={remove}
        />
      )}
      {body}
    </RubricWrapper>
  );
};

const WrappedRubricEditor = wrapInput(RubricEditor);

const RubricsArrayEditor: React.FC<WrappedFieldArrayProps<Rubric>> = (props) => {
  const { fields } = props;
  return (
    <>
      {fields.map((member, index) => (
        <Field
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          name={member}
          fieldName={member}
          enableMovers
          enableUp={index > 0}
          enableDown={index + 1 < fields.length}
          moveDown={() => fields.move(index, index + 1)}
          moveUp={() => fields.move(index, index - 1)}
          remove={() => fields.remove(index)}
          component={WrappedRubricEditor}
        />
      ))}
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

export default WrappedRubricEditor;
