import React, { useMemo, useState } from 'react';
import {
  Alert,
  Form,
  Row,
  Col,
  ButtonGroup,
  ToggleButton,
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

type WrappedInput<T> = React.ComponentType<{ value: T; onChange: (a: T) => void; }>;

function wrapInput<T>(Wrappee : WrappedInput<T>): React.FC<WrappedFieldProps> {
  return (props) => {
    const { input } = props;
    return (
      <ErrorBoundary>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Wrappee {...props} value={input.value} onChange={input.onChange} />
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
            normalize={(newval) => Number.parseInt(newval, 10)}
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
          <Tooltip message={val.message}>
            <ToggleButton
              key={val.value}
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
  showPoints: boolean;
  value: RubricPresets;
  onChange: (newval: RubricPresets) => void;
}> = (props) => {
  const { showPoints, value } = props;
  return (
    <FormSection name="choices">
      <Form.Group as={Row}>
        <Form.Label column sm="1">Label</Form.Label>
        <Col sm="3">
          <Field name="label" component="input" type="text" className="w-100" />
        </Col>
        <Form.Label column sm="2">Direction</Form.Label>
        <Col sm="3">
          <Field name="direction" component={WrappedPresetDirectionEditor} />
        </Col>
        {showPoints && (
          <>
            <Form.Label column sm="1">Points</Form.Label>
            <Col sm="2">
              <Field
                name="points"
                component="input"
                type="number"
                className="w-100"
                normalize={(newval) => Number.parseInt(newval, 10)}
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
          <b className="mx-2">
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
  showPoints: boolean;
  value: Rubric[] | RubricPresets;
  onChange: (newval: Rubric[] | RubricPresets) => void;
}> = (props) => {
  const { showPoints, value } = props;
  if (isRubricPresets(value)) {
    return <Field name="choices" showPoints={showPoints} component={WrappedRubricPresetsEditor} />;
  }
  // eslint-disable-next-line no-use-before-define
  return <FieldArray name="choices" component={RubricsArrayEditor} />;
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

const ChangeRubricType: React.FC<{
  value: Rubric;
  onChange: (newVal: Rubric) => void;
}> = (props) => {
  const { value, onChange } = props;
  const defaultOptions: Record<Rubric['type'], SelectOption<Rubric['type']>> = useMemo(() => ({
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
  }), []);
  const options: SelectOptions<Rubric['type']> = useMemo(
    () => Object.values(defaultOptions),
    [defaultOptions],
  );
  const changeRubricType = (newtype: SelectOption<Rubric['type']>) => {
    onChange({
      // set defaults to blank
      choices: [],
      points: 0,
      // preserve as much as possible
      ...value,
      // and change the type
      type: newtype.value,
    });
  };
  return (
    <Form.Group as={Row}>
      <Form.Label column sm="2"><h5 className="my-0">Rubric type</h5></Form.Label>
      <Col sm="10">
        <Select
          className="z-1000"
          options={options}
          value={defaultOptions[value.type]}
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
      <Field name="choices" showPoints={false} component={WrappedRubricEntriesEditor} />
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
      <Field name="choices" showPoints component={WrappedRubricEntriesEditor} />
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
      <Field name="choices" showPoints component={WrappedRubricEntriesEditor} />
    </>
  );
};


const RubricEditor: React.FC<{
  rubricField: string;
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
    rubricField,
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
        throw new ExhaustiveSwitchError(value, `rubricField is ${rubricField}`);
    }
  }
  return (
    <RubricWrapper
      name={rubricField}
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
          rubricField={member}
          enableMovers
          enableUp={index > 1}
          enableDown={index + 1 < fields.length}
          moveDown={() => fields.move(index, index + 1)}
          moveUp={() => fields.move(index, index - 1)}
          remove={() => fields.remove(index)}
          component={WrappedRubricEditor}
        />
      ))}
    </>
  );
};

export default WrappedRubricEditor;
