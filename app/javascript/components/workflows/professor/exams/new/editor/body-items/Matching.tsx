import React, { useState, useCallback } from 'react';
import {
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import {
  Select, FormControl, InputLabel, MenuItem,
} from '@material-ui/core';
import MoveItem from '@hourglass/workflows/professor/exams/new/old-editor/components/MoveItem';
import Prompted from '@hourglass/workflows/professor/exams/new/editor/body-items/Prompted';
import { alphabetIdx, useRefresher } from '@hourglass/common/helpers';
import {
  Field,
  WrappedFieldProps,
  FieldArray,
  FieldArrayFieldsProps,
  FormSection,
  WrappedFieldArrayProps,
} from 'redux-form';
import EditHTMLs, { EditHTMLField } from '@hourglass/workflows/professor/exams/new/old-editor/components/editHTMLs';
import { MatchingPromptWithAnswer } from '@professor/exams/types';
import './Matching.css';
import { MatchingInfo, MatchingState } from '@hourglass/workflows/student/exams/show/types';
import { EditHTMLVal } from '..';

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
  refreshProps?: React.DependencyList;
}> = (props) => {
  const {
    memberName,
    valueNum,
    enableDown,
    moveDown,
    moveUp,
    remove,
    refreshProps = [],
  } = props;
  const [moversVisible, setMoversVisible] = useState(false);
  const showMovers = (): void => setMoversVisible(true);
  const hideMovers = (): void => setMoversVisible(false);
  return (
    <Row
      className="p-2"
      onMouseOver={showMovers}
      onFocus={showMovers}
      onBlur={hideMovers}
      onMouseOut={hideMovers}
    >
      <Col className="flex-grow-01 pl-0">
        <MoveItem
          visible={moversVisible}
          variant="dark"
          enableUp={valueNum > 0}
          enableDown={enableDown}
          enableDelete
          disabledDeleteMessage=""
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
          refreshProps={refreshProps}
        />
      </Col>
    </Row>
  );
};

interface RenderValueSetup {
  removeAnswer: (oldVal: number) => void;
  swapAnswers: (valA: number, valB: number) => void;
  refreshProps?: React.DependencyList;
  refresh?: () => void;
}
function renderValue(setup: RenderValueSetup) {
  const {
    removeAnswer,
    swapAnswers,
    refreshProps,
    refresh,
  } = setup;
  return (
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
        if (refresh) refresh();
      }}
      moveUp={(): void => {
        fields.move(index, index - 1);
        swapAnswers(index, index - 1);
        if (refresh) refresh();
      }}
      remove={(): void => {
        fields.remove(index);
        removeAnswer(index);
        if (refresh) refresh();
      }}
      refreshProps={refreshProps}
    />
  );
}

const OnePrompt: React.FC<{
  memberName: string;
  numAnswers: number;
  valueNum: number;
  enableDown: boolean;
  moveDown: () => void;
  moveUp: () => void;
  remove: () => void;
  refreshProps?: React.DependencyList;
}> = (props) => {
  const {
    memberName,
    numAnswers,
    valueNum,
    enableDown,
    moveDown,
    moveUp,
    remove,
    refreshProps = [],
  } = props;
  const [moversVisible, setMoversVisible] = useState(false);
  const showMovers = (): void => setMoversVisible(true);
  const hideMovers = (): void => setMoversVisible(false);
  return (
    <FormSection name={memberName}>
      <Row
        className="p-2"
        onMouseOver={showMovers}
        onFocus={showMovers}
        onBlur={hideMovers}
        onMouseOut={hideMovers}
      >
        <div className="float-left pl-0">
          <MoveItem
            visible={moversVisible}
            variant="dark"
            enableUp={valueNum > 0}
            enableDown={enableDown}
            enableDelete
            disabledDeleteMessage=""
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
            refreshProps={refreshProps}
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

interface RenderPromptSetup {
  numAnswers: number;
  refreshProps?: React.DependencyList;
  refresh?: () => void;
}
function renderPrompt(setup: RenderPromptSetup) {
  const { numAnswers, refreshProps, refresh } = setup;
  return (
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
        if (refresh) refresh();
      }}
      moveUp={(): void => {
        fields.move(index, index - 1);
        if (refresh) refresh();
      }}
      remove={(): void => {
        fields.remove(index);
        if (refresh) refresh();
      }}
      refreshProps={refreshProps}
    />
  );
}

const EditPrompts: React.FC<
  RenderPromptSetup & WrappedFieldArrayProps<MatchingPromptWithAnswer>
> = (props) => {
  const {
    fields,
    numAnswers,
    refreshProps,
    refresh,
  } = props;
  const renderPrompts = useCallback(renderPrompt({
    numAnswers,
    refreshProps,
    refresh,
  }), [numAnswers, ...refreshProps]);
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
  const [refresher, refresh] = useRefresher();
  const refreshProps: React.DependencyList = [refresher];
  return (
    <FieldArray
      name="prompts"
      component={EditPrompts}
      numAnswers={length}
      refresh={refresh}
      refreshProps={refreshProps}
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
  const [refresher, refresh] = useRefresher();
  const refreshProps: React.DependencyList = [refresher];

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
  }, [value, onChange, refresher]);

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
  }, [value, onChange, refresher]);
  const renderValues = useCallback(renderValue({
    removeAnswer,
    swapAnswers,
    refresh,
    refreshProps,
  }), [removeAnswer, swapAnswers]);
  return (
    <FieldArray
      name="values"
      component={EditHTMLs}
      renderOptions={renderValues}
    />
  );
};

const Matching: React.FC<{
  info: MatchingInfo;
  id: string;
  answer: MatchingState;
}> = (props) => {
  const {
    info,
    id,
    answer,
  } = props;
  return (
    <>
      <Prompted
        value={info.prompt}
        onChange={console.log}
      />
      <Row>
        <Col sm={6}>
          <Row className="p-2">
            <Col className="text-center p-0">
              <EditHTMLVal
                className="bg-white rounded"
                value={info.promptsLabel || {
                  type: 'HTML',
                  value: '',
                }}
                onChange={console.log}
                debounceDelay={1000}
                placeholder="Column A"
              />
            </Col>
          </Row>
          {/* <RenderPrompts
            prompts={info.prompts}
          /> */}
          {/* <Field name="values" component={RenderPrompts} /> */}
        </Col>
        <Col sm={6}>
          <Row className="p-2">
            <Col className="text-center p-0">
              <EditHTMLVal
                className="bg-white rounded"
                value={info.valuesLabel || {
                  type: 'HTML',
                  value: '',
                }}
                onChange={console.log}
                debounceDelay={1000}
                placeholder="Column B"
              />
            </Col>
          </Row>
          {/* <Field name="prompts" component={RenderValues} /> */}
        </Col>
      </Row>
    </>
  );
};

export default Matching;
