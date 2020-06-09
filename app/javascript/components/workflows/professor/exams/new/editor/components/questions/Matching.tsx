import React, { useState } from 'react';
import {
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import {
  Select, FormControl, InputLabel, MenuItem,
} from '@material-ui/core';
import { MatchingInfo, MatchingState, HTMLVal } from '@student/exams/show/types';
import CustomEditor from '@professor/exams/new/editor/components/CustomEditor';
import MoveItem from '@professor/exams/new/editor/containers/MoveItem';
import { UpdateBodyItemAction } from '@professor/exams/new/types';
import './questions.scss';


interface MatchingProps {
  info: MatchingInfo;
  value: MatchingState;
  onChange: (newInfo: MatchingInfo, newVal: MatchingState) => void;
  makeChangeAction: (newInfo: MatchingInfo, newState: MatchingState) => UpdateBodyItemAction;
  disabled: boolean;
}

const ChooseRightAnswer: React.FC<{
  curValue: number;
  choices: string[];
  onChange: (event: React.ChangeEvent<{ value: number }>) => void;
}> = (props) => {
  const {
    curValue,
    choices,
    onChange,
  } = props;
  return (
    <FormControl variant="outlined">
      <InputLabel>Match</InputLabel>
      <Select
        margin="dense"
        value={curValue}
        onChange={onChange}
        label="Match"
      >
        <MenuItem value={-1}>
          <em>None</em>
        </MenuItem>
        {(choices.map((_v, j) => (
          <MenuItem
            // Question choices are STATIC.
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

const Matching: React.FC<MatchingProps> = (props) => {
  const {
    info,
    value,
    onChange,
    makeChangeAction,
  } = props;
  const {
    promptLabel, prompts, valuesLabel, values,
  } = info;
  const [promptMoversVisible, rawSetPromptMoversVisible] = useState([]);
  const setPromptMoversVisible = (index: number, visible: boolean): void => {
    const newMovers = [...promptMoversVisible];
    newMovers[index] = visible;
    rawSetPromptMoversVisible(newMovers);
  };
  const [valueMoversVisible, rawSetValueMoversVisible] = useState([]);
  const setValueMoversVisible = (index: number, visible: boolean): void => {
    const newMovers = [...valueMoversVisible];
    newMovers[index] = visible;
    rawSetValueMoversVisible(newMovers);
  };
  const addPrompt = (): void => {
    const newPrompts = [...prompts];
    newPrompts.push('');
    onChange({ ...info, prompts: newPrompts }, value);
  };
  const deletePrompt = (index: number): UpdateBodyItemAction => {
    const newPrompts = [...prompts];
    newPrompts.splice(index, 1);
    return makeChangeAction({ ...info, prompts: newPrompts }, value);
  };
  const movePrompt = (from: number, to: number): UpdateBodyItemAction => {
    const newPrompts = [...prompts];
    const fromOpt = newPrompts[from];
    newPrompts.splice(from, 1);
    newPrompts.splice(to, 0, fromOpt);
    return makeChangeAction({ ...info, prompts: newPrompts }, value);
  };

  const addValue = (): void => {
    const newValues = [...values];
    newValues.push('');
    onChange({ ...info, values: newValues }, value);
  };
  const deleteValue = (index: number): UpdateBodyItemAction => {
    const newValues = [...values];
    newValues.splice(index, 1);
    const newValue = { ...value };
    Object.keys(newValue).forEach((key) => {
      if (newValue[key] > index) {
        newValue[key] -= 1;
      } else if (newValue[key] === index) {
        delete newValue[key];
      }
    });
    return makeChangeAction({ ...info, values: newValues }, newValue);
  };
  const moveValue = (from: number, to: number): UpdateBodyItemAction => {
    const newValues = [...values];
    const fromOpt = newValues[from];
    newValues.splice(from, 1);
    newValues.splice(to, 0, fromOpt);
    const newValue = { ...value };
    Object.keys(newValue).forEach((key) => {
      if (newValue[key] === from) {
        newValue[key] = to;
      } else if (newValue[key] === to) {
        newValue[key] = to - 1;
      }
    });
    return makeChangeAction({ ...info, values: newValues }, newValue);
  };


  const setColA = (newColA: HTMLVal): void => {
    onChange({
      ...info,
      promptLabel: newColA,
    }, value);
  };
  const setColB = (newColB: HTMLVal): void => {
    onChange({
      ...info,
      valuesLabel: newColB,
    }, value);
  };
  const updateAnswer = (index: number, event: React.ChangeEvent<{ value: number }>): void => {
    const val = event.target.value;
    const ret = { ...value };
    ret[index] = val;
    onChange(info, ret);
  };
  const updatePrompt = (index: number, newPrompt: string): void => {
    const newPrompts = [...prompts];
    newPrompts[index] = newPrompt;
    onChange({ ...info, prompts: newPrompts }, value);
  };
  const updateValue = (index: number, newValue: string): void => {
    const newValues = [...values];
    newValues[index] = newValue;
    onChange({ ...info, values: newValues }, value);
  };

  return (
    <Row>
      <Col sm={6}>
        <Row className="p-2">
          <Col className="text-center p-0">
            <CustomEditor
              className="bg-white"
              theme="bubble"
              value={promptLabel?.value ?? 'Column A'}
              onChange={(newVal) => setColA({
                type: 'HTML',
                value: newVal,
              })}
            />
          </Col>
        </Row>
        {prompts.map((p, idx) => {
          const valueI = value?.[idx] ?? -1;
          return (
            <Row
              className="p-2"
              // We don't have a better option than this index right now.
              // eslint-disable-next-line react/no-array-index-key
              key={idx}
              onMouseOver={(): void => setPromptMoversVisible(idx, true)}
              onFocus={(): void => setPromptMoversVisible(idx, true)}
              onBlur={(): void => setPromptMoversVisible(idx, false)}
              onMouseOut={(): void => setPromptMoversVisible(idx, false)}
            >
              <Col className="flex-grow-01 pl-0">
                <MoveItem
                  visible={promptMoversVisible[idx]}
                  variant="dark"
                  enableUp={idx > 0}
                  enableDown={idx + 1 < prompts.length}
                  onDelete={(): UpdateBodyItemAction => deletePrompt(idx)}
                  onDown={(): UpdateBodyItemAction => movePrompt(idx, idx + 1)}
                  onUp={(): UpdateBodyItemAction => movePrompt(idx - 1, idx)}
                />
                {`${String.fromCharCode(65 + idx)}.`}
              </Col>
              <Col>
                <CustomEditor
                  className="bg-white"
                  theme="bubble"
                  value={p}
                  placeholder="Enter a new prompt"
                  onChange={(newPrompt): void => updatePrompt(idx, newPrompt)}
                />
              </Col>
              <Col sm={2}>
                <ChooseRightAnswer
                  curValue={valueI}
                  choices={values}
                  onChange={(e): void => updateAnswer(idx, e)}
                />
              </Col>
            </Row>
          );
        })}
        <Row className="p-2">
          <Col className="text-center">
            <Button
              variant="dark"
              onClick={addPrompt}
            >
              Add new prompt
            </Button>
          </Col>
        </Row>
      </Col>
      <Col sm={6}>
        <Row className="p-2">
          <Col className="text-center p-0">
            <CustomEditor
              className="bg-white"
              theme="bubble"
              value={valuesLabel?.value ?? 'Column B'}
              onChange={(newVal) => setColB({
                type: 'HTML',
                value: newVal,
              })}
            />
          </Col>
        </Row>
        {values.map((v, idx) => (
          <Row
            className="p-2"
            // We don't have a better option than this index right now.
            // eslint-disable-next-line react/no-array-index-key
            key={idx}
            onMouseOver={(): void => setValueMoversVisible(idx, true)}
            onFocus={(): void => setValueMoversVisible(idx, true)}
            onBlur={(): void => setValueMoversVisible(idx, false)}
            onMouseOut={(): void => setValueMoversVisible(idx, false)}
          >
            <Col className="flex-grow-01 pl-0">
              <MoveItem
                visible={valueMoversVisible[idx]}
                variant="dark"
                enableUp={idx > 0}
                enableDown={idx + 1 < prompts.length}
                onDelete={(): UpdateBodyItemAction => deleteValue(idx)}
                onDown={(): UpdateBodyItemAction => moveValue(idx, idx + 1)}
                onUp={(): UpdateBodyItemAction => moveValue(idx - 1, idx)}
              />
              {`${idx + 1}.`}
            </Col>
            <Col className="pr-0">
              <CustomEditor
                className="bg-white pr-0"
                theme="bubble"
                value={v}
                placeholder="Enter a new choice"
                onChange={(newValue): void => updateValue(idx, newValue)}
              />
            </Col>
          </Row>
        ))}
        <Row className="p-2">
          <Col className="text-center">
            <Button
              variant="dark"
              onClick={addValue}
            >
              Add new choice
            </Button>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default Matching;
