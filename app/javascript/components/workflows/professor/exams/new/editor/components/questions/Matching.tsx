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
import MoveItem from '@professor/exams/new/editor/components/MoveItem';
import { alphabetIdx } from '@hourglass/common/helpers';
import { Field, WrappedFieldProps, FieldArray, WrappedFieldArrayProps } from 'redux-form';
import EditHTMLs, { EditHTMLField } from '../editHTMLs';

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

const renderValue = (member, index, fields) => (
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
        {`${alphabetIdx(valueNum)}.`}
      </Col>
      <Col className="pr-0">
        <Field
          name={memberName}
          component={EditHTMLField}
          theme="bubble"
          placeholder="Enter a new prompt"
        />
      </Col>
      <Col sm={2}>
        <Field
          name={`answer[${valueNum}]`}
          component={ChooseRightAnswer}
          numChoices={10} // TODO
        />
      </Col>
    </Row>
  );
};

const renderPrompt = (member, index, fields) => (
  <OnePrompt
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

const Matching: React.FC<MatchingProps> = (props) => {
  const {
    qnum,
    pnum,
    bnum,
  } = props;
  return (
    <Row>
      <Col sm={6}>
        <Row className="p-2">
          <Col className="text-center p-0">
            <Field name="promptsLabel" component={EditColName} defaultLabel="Column A" />
          </Col>
        </Row>
        <FieldArray name="prompts" component={EditHTMLs} renderOptions={renderPrompt} />
      </Col>
      <Col sm={6}>
        <Row className="p-2">
          <Col className="text-center p-0">
            <Field name="valuesLabel" component={EditColName} defaultLabel="Column B" />
          </Col>
        </Row>
        <FieldArray name="values" component={EditHTMLs} renderOptions={renderValue} prompt="Add new choice" />
      </Col>
    </Row>
  );
};

//   const [promptMoversVisible, rawSetPromptMoversVisible] = useState([]);
//   const setPromptMoversVisible = (index: number, visible: boolean): void => {
//     const newMovers = [...promptMoversVisible];
//     newMovers[index] = visible;
//     rawSetPromptMoversVisible(newMovers);
//   };
//   const [valueMoversVisible, rawSetValueMoversVisible] = useState([]);
//   const setValueMoversVisible = (index: number, visible: boolean): void => {
//     const newMovers = [...valueMoversVisible];
//     newMovers[index] = visible;
//     rawSetValueMoversVisible(newMovers);
//   };
//   const addPrompt = (): void => {
//     const newPrompts = [...prompts];
//     newPrompts.push({
//       type: 'HTML',
//       value: '',
//     });
//     onChange({ ...info, prompts: newPrompts }, value);
//   };
//   const deletePrompt = (index: number): UpdateBodyItemAction => {
//     const newPrompts = [...prompts];
//     newPrompts.splice(index, 1);
//     return makeChangeAction({ ...info, prompts: newPrompts }, value);
//   };
//   const movePrompt = (from: number, to: number): UpdateBodyItemAction => {
//     const newPrompts = [...prompts];
//     const fromOpt = newPrompts[from];
//     newPrompts.splice(from, 1);
//     newPrompts.splice(to, 0, fromOpt);
//     return makeChangeAction({ ...info, prompts: newPrompts }, value);
//   };
//   const addValue = (): void => {
//     const newValues = [...values];
//     newValues.push({
//       type: 'HTML',
//       value: '',
//     });
//     onChange({ ...info, values: newValues }, value);
//   };
//   const deleteValue = (index: number): UpdateBodyItemAction => {
//     const newValues = [...values];
//     newValues.splice(index, 1);
//     const newValue = { ...value };
//     Object.keys(newValue).forEach((key) => {
//       if (newValue[key] > index) {
//         newValue[key] -= 1;
//       } else if (newValue[key] === index) {
//         delete newValue[key];
//       }
//     });
//     return makeChangeAction({ ...info, values: newValues }, newValue);
//   };
//   const moveValue = (from: number, to: number): UpdateBodyItemAction => {
//     const newValues = [...values];
//     const fromOpt = newValues[from];
//     newValues.splice(from, 1);
//     newValues.splice(to, 0, fromOpt);
//     const newValue = { ...value };
//     Object.keys(newValue).forEach((key) => {
//       if (newValue[key] === from) {
//         newValue[key] = to;
//       } else if (newValue[key] === to) {
//         newValue[key] = to - 1;
//       }
//     });
//     return makeChangeAction({ ...info, values: newValues }, newValue);
//   };
//   const updateAnswer = (index: number, event: React.ChangeEvent<{ value: number }>): void => {
//     const val = event.target.value;
//     const ret = { ...value };
//     ret[index] = val;
//     onChange(info, ret);
//   };
//   const updatePrompt = (index: number, newPrompt: HTMLVal): void => {
//     const newPrompts = [...prompts];
//     newPrompts[index] = newPrompt;
//     onChange({ ...info, prompts: newPrompts }, value);
//   };
//   const updateValue = (index: number, newValue: HTMLVal): void => {
//     const newValues = [...values];
//     newValues[index] = newValue;
//     onChange({ ...info, values: newValues }, value);
//   };

export default Matching;
