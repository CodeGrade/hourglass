import React, { useState } from 'react';
import {
  Row,
  Col,
} from 'react-bootstrap';
import {
  Select, FormControl, InputLabel, MenuItem,
} from '@material-ui/core';
import CustomEditor from '@professor/exams/new/editor/components/CustomEditor';
import MoveItem from '@professor/exams/new/editor/components/MoveItem';
import { alphabetIdx } from '@hourglass/common/helpers';
import {
  Field,
  WrappedFieldProps,
  FieldArray,
  FieldArrayFieldsProps,
  FormSection,
} from 'redux-form';
import EditHTMLs, { EditHTMLField } from '@professor/exams/new/editor/components/editHTMLs';
import { HTMLVal } from '@student/exams/show/types';

interface MatchingProps {
  qnum: number;
  pnum: number;
  bnum: number;
}

const ChooseRightAnswer: React.FC<WrappedFieldProps & {
  numChoices: number;
}> = (props) => {
  const {
    input,
    numChoices,
  } = props;
  const {
    value,
    onChange,
  } = input;
  const valueI = value ?? -1;
  return (
    <FormControl variant="outlined">
      <InputLabel>Match</InputLabel>
      <Select
        margin="dense"
        value={valueI}
        onChange={onChange}
        label="Match"
      >
        <MenuItem value={-1}>
          <em>None</em>
        </MenuItem>
        {(new Array(numChoices).fill(0).map((_v, j) => (
          <MenuItem
            // eslint-disable-next-line react/no-array-index-key
            key={j}
            value={j}
          >
            {j + 1}
          </MenuItem>
        )))}
      </Select>
    </FormControl>
  );
};

const OneValue: React.FC<{
  memberName: string;
  valueNum: number;
  enableDown: boolean;
  moveDown: () => void;
  moveUp: () => void;
  remove: () => void;
}> = (props) => {
  const {
    memberName,
    valueNum,
    enableDown,
    moveDown,
    moveUp,
    remove,
  } = props;
  const [moversVisible, setMoversVisible] = useState(false);
  return (
    <Row
      className="p-2"
      onMouseOver={(): void => setMoversVisible(true)}
      onFocus={(): void => setMoversVisible(true)}
      onBlur={(): void => setMoversVisible(false)}
      onMouseOut={(): void => setMoversVisible(false)}
    >
      <Col className="flex-grow-01 pl-0">
        <MoveItem
          visible={moversVisible}
          variant="dark"
          enableUp={valueNum > 0}
          enableDown={enableDown}
          onUp={moveUp}
          onDown={moveDown}
          onDelete={remove}
        />
        {`${valueNum + 1}.`}
      </Col>
      <Col className="pr-0">
        <Field
          name={memberName}
          component={EditHTMLField}
          theme="bubble"
          placeholder="Enter a new choice"
        />
      </Col>
    </Row>
  );
};

const renderValue = (
  member,
  index,
  fields,
) => (
  <OneValue
    // eslint-disable-next-line react/no-array-index-key
    key={index}
    valueNum={index}
    memberName={member}
    enableDown={index + 1 < fields.length}
    moveDown={(): void => {
      fields.move(index, index + 1);
    }}
    moveUp={(): void => {
      fields.move(index, index - 1);
    }}
    remove={(): void => {
      fields.remove(index);
    }}
  />
);

const OnePrompt: React.FC<{
  memberName: string;
  numChoices: number;
  valueNum: number;
  enableDown: boolean;
  moveDown: () => void;
  moveUp: () => void;
  remove: () => void;
}> = (props) => {
  const {
    memberName,
    numChoices,
    valueNum,
    enableDown,
    moveDown,
    moveUp,
    remove,
  } = props;
  const [moversVisible, setMoversVisible] = useState(false);
  return (
    <FormSection name={memberName}>
      <Row
        className="p-2"
        onMouseOver={(): void => setMoversVisible(true)}
        onFocus={(): void => setMoversVisible(true)}
        onBlur={(): void => setMoversVisible(false)}
        onMouseOut={(): void => setMoversVisible(false)}
      >
        <Col className="flex-grow-01 pl-0">
          <MoveItem
            visible={moversVisible}
            variant="dark"
            enableUp={valueNum > 0}
            enableDown={enableDown}
            onUp={moveUp}
            onDown={moveDown}
            onDelete={remove}
          />
          {`${alphabetIdx(valueNum)}.`}
        </Col>
        <Col className="pr-0">
          <Field
            name="html"
            component={EditHTMLField}
            theme="bubble"
            placeholder="Enter a new prompt"
          />
        </Col>
        <Col sm={2}>
          <Field
            name="answer"
            component={ChooseRightAnswer}
            numChoices={numChoices}
          />
        </Col>
      </Row>
    </FormSection>
  );
};

const renderPrompt = ({
  numChoices,
}) => (
  member: string,
  index: number,
  fields: FieldArrayFieldsProps<HTMLVal>,
) => (
  <OnePrompt
    // eslint-disable-next-line react/no-array-index-key
    key={index}
    valueNum={index}
    numChoices={numChoices}
    memberName={member}
    enableDown={index + 1 < fields.length}
    moveDown={(): void => {
      fields.move(index, index + 1);
    }}
    moveUp={(): void => {
      fields.move(index, index - 1);
    }}
    remove={(): void => {
      fields.remove(index);
    }}
  />
);

const EditColName: React.FC<WrappedFieldProps & {
  defaultLabel: string;
}> = (props) => {
  const {
    input,
    defaultLabel,
  } = props;
  const {
    value,
    onChange,
  } = input;
  return (
    <CustomEditor
      className="bg-white"
      theme="bubble"
      value={value.value ?? defaultLabel}
      onChange={(newVal) => onChange({
        type: 'HTML',
        value: newVal,
      })}
    />
  );
};

const RenderPrompts: React.FC<WrappedFieldProps> = (props) => {
  const { input } = props;
  const { length } = input.value;
  const renderPrompts = React.useCallback(renderPrompt({
    numChoices: length,
  }), [length]);
  return (
    <FieldArray
      name="prompts"
      component={EditHTMLs}
      renderOptions={renderPrompts}
    />
  );
};

const Matching: React.FC<MatchingProps> = (_props) => (
  <Row>
    <Col sm={6}>
      <Row className="p-2">
        <Col className="text-center p-0">
          <Field name="promptsLabel" component={EditColName} defaultLabel="Column A" />
        </Col>
      </Row>
      <Field name="prompts" component={RenderPrompts} />
    </Col>
    <Col sm={6}>
      <Row className="p-2">
        <Col className="text-center p-0">
          <Field name="valuesLabel" component={EditColName} defaultLabel="Column B" />
        </Col>
      </Row>
      <FieldArray name="values" component={EditHTMLs} renderOptions={renderValue} />
    </Col>
  </Row>
);

export default Matching;
