import React, { useMemo } from 'react';
import {
  Alert,
  Form,
  Row,
  Col,
  ButtonGroup,
  ToggleButton,
} from 'react-bootstrap';
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
import {
  FormSection,
  Field,
  FieldArray,
  WrappedFieldArrayProps,
  WrappedFieldProps,
} from 'redux-form';
import Select from 'react-select';
import { ExhaustiveSwitchError, SelectOption, SelectOptions } from '@hourglass/common/helpers';
import { EditHTMLField } from './components/editHTMLs';
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


const RubricPresetEditor: React.FC = () => (
  <Alert variant="warning">
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
          <RubricPresetEditor />
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
    { name: 'Credit', value: 'credit' },
    { name: 'Deduction', value: 'deduction' },
  ];
  return (
    <ButtonGroup toggle>
      {values.map((val) => {
        const checked = (value === val.value);
        return (
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
        );
      })}
    </ButtonGroup>
  );
};

const WrappedPresetDirectionEditor = wrapInput(RubricPresetDirectionEditor);

const RubricPresetsEditor: React.FC = () => (
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
    </Form.Group>
    {/* Mercy:
    <i>{mercy}</i> */}
    <Form.Label>Presets</Form.Label>
    <FieldArray name="presets" component={RubricPresetsArrayEditor} />
  </FormSection>
);

const WrappedRubricPresetsEditor = wrapInput(RubricPresetsEditor);

const RubricEntriesEditor: React.FC<{
  value: Rubric[] | RubricPresets,
}> = (props) => {
  const { value } = props;
  if (isRubricPresets(value)) {
    return <Field name="choices" component={WrappedRubricPresetsEditor} />;
  }
  // eslint-disable-next-line no-use-before-define
  return <FieldArray name="choices" component={RubricsArrayEditor} />;
};

const WrappedRubricEntriesEditor = wrapInput(RubricEntriesEditor);

const RubricWrapper: React.FC<{ name: string }> = (props) => {
  const { name, children } = props;
  return (
    <FormSection name={name}>
      <div className="rubric">
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
          options={options}
          value={defaultOptions[value.type]}
          onChange={changeRubricType}
        />
      </Col>
    </Form.Group>
  );
};

const EditRubricNone: React.FC<{
  rubricField: string;
  value: RubricNone;
  onChange: (newVal: Rubric) => void
}> = (props) => {
  const { rubricField, value, onChange } = props;
  return (
    <RubricWrapper name={rubricField}>
      <ChangeRubricType value={value} onChange={onChange} />
    </RubricWrapper>
  );
};

const EditRubricAll: React.FC<{
  rubricField: string;
  value: RubricAll;
  onChange: (newVal: Rubric) => void
}> = (props) => {
  const { rubricField, value, onChange } = props;
  return (
    <RubricWrapper name={rubricField}>
      <ChangeRubricType value={value} onChange={onChange} />
      <Field
        className="bg-white border rounded"
        name="description"
        component={EditHTMLField}
        theme="bubble"
        placeholder="Give use-all rubric instructions here"
      />
      <Field name="choices" component={WrappedRubricEntriesEditor} />
    </RubricWrapper>
  );
};

const EditRubricAny: React.FC<{
  rubricField: string;
  value: RubricAny;
  onChange: (newVal: Rubric) => void
}> = (props) => {
  const { rubricField, value, onChange } = props;
  return (
    <RubricWrapper name={rubricField}>
      <ChangeRubricType value={value} onChange={onChange} />
      <Field
        className="bg-white border rounded"
        name="description"
        component={EditHTMLField}
        theme="bubble"
        placeholder="Give use-any rubric instructions here"
      />
      <Field name="choices" component={WrappedRubricEntriesEditor} />
    </RubricWrapper>
  );
};

const EditRubricOne: React.FC<{
  rubricField: string;
  value: RubricOne;
  onChange: (newVal: Rubric) => void
}> = (props) => {
  const { rubricField, value, onChange } = props;
  return (
    <RubricWrapper name={rubricField}>
      <ChangeRubricType value={value} onChange={onChange} />
      <Field
        className="bg-white border rounded"
        name="description"
        component={EditHTMLField}
        theme="bubble"
        placeholder="Give use-one rubric instructions here"
      />
      <Field name="choices" component={WrappedRubricEntriesEditor} />
    </RubricWrapper>
  );
};


const RubricEditor: React.FC<{
  rubricField: string;
  value: Rubric;
  onChange: (newval: Rubric) => void;
}> = (props) => {
  const { rubricField, value, onChange } = props;
  if (value === undefined) {
    return (
      <EditRubricNone
        rubricField={rubricField}
        onChange={onChange}
        value={{ type: 'none' }}
      />
    );
  }
  switch (value.type) {
    case 'none': return <EditRubricNone rubricField={rubricField} onChange={onChange} value={value} />;
    case 'all': return <EditRubricAll rubricField={rubricField} onChange={onChange} value={value} />;
    case 'any': return <EditRubricAny rubricField={rubricField} onChange={onChange} value={value} />;
    case 'one': return <EditRubricOne rubricField={rubricField} onChange={onChange} value={value} />;
    default:
      throw new ExhaustiveSwitchError(value, `rubricField is ${rubricField}`);
  }
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
          component={WrappedRubricEditor}
        />
      ))}
    </>
  );
};

export default WrappedRubricEditor;
