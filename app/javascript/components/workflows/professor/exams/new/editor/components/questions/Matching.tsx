import React, { useState, useCallback } from 'react';
import {
  Row,
  Col,
  Button,
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
  WrappedFieldArrayProps,
} from 'redux-form';
import EditHTMLs, { EditHTMLField } from '@professor/exams/new/editor/components/editHTMLs';
import { MatchingPromptWithAnswer } from '@professor/exams/types';
import './Matching.css';

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
    value = -1,
    onChange,
  } = input;
  return (
    <FormControl variant="outlined" className="w-100">
      <InputLabel>Match</InputLabel>
      <Select
        margin="dense"
        value={value}
        onChange={onChange}
        label="Match"
        className="w-100"
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

const renderValue = ({
  removeAnswer,
  swapAnswers,
}: {
  removeAnswer: (oldVal: number) => void;
  swapAnswers: (valA: number, valB: number) => void;
}) => (
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
      swapAnswers(index, index + 1);
    }}
    moveUp={(): void => {
      fields.move(index, index - 1);
      swapAnswers(index, index - 1);
    }}
    remove={(): void => {
      fields.remove(index);
      removeAnswer(index);
    }}
  />
);

const OnePrompt: React.FC<{
  memberName: string;
  numAnswers: number;
  valueNum: number;
  enableDown: boolean;
  moveDown: () => void;
  moveUp: () => void;
  remove: () => void;
}> = (props) => {
  const {
    memberName,
    numAnswers,
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
        <div className="float-left pl-0">
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
        </div>
        <Col>
          <Field
            name="html"
            component={EditHTMLField}
            theme="bubble"
            placeholder="Enter a new prompt"
          />
        </Col>
        <div className="float-right match-box">
          <Field
            name="answer"
            component={ChooseRightAnswer}
            numChoices={numAnswers}
          />
        </div>
      </Row>
    </FormSection>
  );
};

const renderPrompt = ({
  numAnswers,
}) => (
  member: string,
  index: number,
  fields: FieldArrayFieldsProps<MatchingPromptWithAnswer>,
) => (
  <OnePrompt
    // eslint-disable-next-line react/no-array-index-key
    key={index}
    valueNum={index}
    numAnswers={numAnswers}
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

const EditPrompts: React.FC<{
  numAnswers: number;
} & WrappedFieldArrayProps<MatchingPromptWithAnswer>> = (props) => {
  const {
    fields,
    numAnswers,
  } = props;
  const renderPrompts = React.useCallback(renderPrompt({
    numAnswers,
  }), [numAnswers]);
  return (
    <>
      {fields.map(renderPrompts)}
      <Row className="p-2">
        <Col className="text-center p-0">
          <Button
            variant="dark"
            onClick={(): void => {
              fields.push({
                html: {
                  type: 'HTML',
                  value: '',
                },
                answer: -1,
              });
            }}
          >
            Add new option
          </Button>
        </Col>
      </Row>
    </>
  );
};

const RenderPrompts: React.FC<WrappedFieldProps> = (props) => {
  const { input } = props;
  const { length } = input.value;
  return (
    <FieldArray
      name="prompts"
      component={EditPrompts}
      numAnswers={length}
    />
  );
};

const RenderValues: React.FC<WrappedFieldProps> = (props) => {
  const { input } = props;
  const {
    value,
    onChange,
  }: {
    value: MatchingPromptWithAnswer[],
    onChange: (newVal: MatchingPromptWithAnswer[]) => void;
  } = input;

  /**
   * Set all answers that used to have oldVal to -1, and shift answers below it up.
   */
  const removeAnswer = useCallback((oldVal: number): void => {
    onChange(value.map((v) => {
      const ret = {
        ...v,
      };
      // Set answer to -1
      if (v.answer === oldVal) ret.answer = -1;

      // Shift up values below the removed one.
      if (v.answer > oldVal) ret.answer -= 1;
      return ret;
    }));
  }, [value, onChange]);

  /**
   * Swap all answers with valA to be valB and vice-versa.
   */
  const swapAnswers = useCallback((valA: number, valB: number): void => {
    // Trigger onChange with a new value
    onChange(value.map((v) => {
      const ret = {
        ...v,
      };
      if (v.answer === valA) ret.answer = valB;
      if (v.answer === valB) ret.answer = valA;
      return ret;
    }));
  }, [value, onChange]);
  const renderValues = useCallback(
    renderValue({ removeAnswer, swapAnswers }),
    [removeAnswer, swapAnswers],
  );
  return (
    <FieldArray
      name="values"
      component={EditHTMLs}
      renderOptions={renderValues}
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
      <Field name="values" component={RenderPrompts} />
    </Col>
    <Col sm={6}>
      <Row className="p-2">
        <Col className="text-center p-0">
          <Field name="valuesLabel" component={EditColName} defaultLabel="Column B" />
        </Col>
      </Row>
      <Field name="prompts" component={RenderValues} />
    </Col>
  </Row>
);

export default Matching;
