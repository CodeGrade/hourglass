import React, { useState } from 'react';
import {
  Form,
  Row,
  Col,
  Table,
  Button,
} from 'react-bootstrap';
import {
  AllThatApplyInfo,
  AllThatApplyState,
  HTMLVal,
  BodyItem,
  AnswerState,
} from '@student/exams/show/types';
import Prompted from '@professor/exams/new/editor/components/questions/Prompted';
import CustomEditor from '@professor/exams/new/editor/components/CustomEditor';
import { FaCheck } from 'react-icons/fa';
import Icon from '@student/exams/show/components/Icon';
import MoveItem from '@professor/exams/new/editor/containers/MoveItem';
import { UpdateBodyItemAction } from '@professor/exams/new/types';
import { arrayLikeToArray } from '@professor/exams/new/reducers/contents';

interface AllThatApplyProps {
  info: AllThatApplyInfo;
  value: AllThatApplyState;
  onChange: (newInfo: AllThatApplyInfo, newVal: AllThatApplyState) => void;
  makeChangeAction: (newInfo: BodyItem, newState: AnswerState) => UpdateBodyItemAction;
  qnum: number;
  pnum: number;
  bnum: number;
}

const AllThatApply: React.FC<AllThatApplyProps> = (props) => {
  const {
    makeChangeAction,
    onChange,
    info,
    value,
    qnum,
    pnum,
    bnum,
  } = props;
  const { options, prompt } = info;
  const [moversVisible, rawSetMoversVisible] = useState([]);
  const setMoversVisible = (index: number, visible: boolean): void => {
    const newMovers = [...moversVisible];
    newMovers[index] = visible;
    rawSetMoversVisible(newMovers);
  };
  const toggleAnswer = (index: number): void => {
    const newValue = { ...value };
    newValue[index] = !newValue[index];
    onChange(info, newValue);
  };
  const setPrompt = (index: number, newPrompt: HTMLVal): void => {
    const newOptions = [...info.options];
    newOptions[index] = newPrompt;
    onChange({ ...info, options: newOptions }, value);
  };
  const addOption = (): void => {
    const newOptions = [...options];
    newOptions.push('');
    onChange({ ...info, options: newOptions }, value);
  };
  const deleteOption = (index: number): UpdateBodyItemAction => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    const newValue = arrayLikeToArray(value, options.length);
    newValue.splice(index, 1);
    return makeChangeAction({ ...info, options: newOptions }, newValue);
  };
  const moveOption = (from: number, to: number): UpdateBodyItemAction => {
    const newOptions = [...info.options];
    const fromOpt = newOptions[from];
    newOptions.splice(from, 1);
    newOptions.splice(to, 0, fromOpt);
    const newValue = arrayLikeToArray(value, options.length);
    const fromAns = newValue[from];
    newValue.splice(from, 1);
    newValue.splice(to, 0, fromAns);
    return makeChangeAction({ ...info, options: newOptions }, newValue);
  };
  return (
    <>
      <Prompted
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
        prompt={prompt}
        onChange={(newPrompt): void => {
          if (onChange) { onChange({ ...info, prompt: newPrompt }, value); }
        }}
      />
      <Form.Group as={Row} controlId={`${qnum}-${pnum}-${bnum}-answer`}>
        <Form.Label column sm={2}>Answers</Form.Label>
        <Col sm={10}>
          <Table bordered hover size="sm">
            <thead>
              <tr>
                <th>Correct?</th>
                <th className="w-100">Prompt</th>
              </tr>
            </thead>
            <tbody>
              {options.map((option, idx) => {
                const selected = value[idx];
                return (
                  <tr
                    // We don't have a better option than this index right now.
                    // eslint-disable-next-line react/no-array-index-key
                    key={idx}
                    onMouseOver={(): void => setMoversVisible(idx, true)}
                    onFocus={(): void => setMoversVisible(idx, true)}
                    onBlur={(): void => setMoversVisible(idx, false)}
                    onMouseOut={(): void => setMoversVisible(idx, false)}
                  >
                    <td className="text-center">
                      <MoveItem
                        visible={moversVisible[idx]}
                        variant="dark"
                        enableUp={idx > 0}
                        enableDown={idx + 1 < options.length}
                        onDelete={(): UpdateBodyItemAction => deleteOption(idx)}
                        onDown={(): UpdateBodyItemAction => moveOption(idx, idx + 1)}
                        onUp={(): UpdateBodyItemAction => moveOption(idx - 1, idx)}
                      />
                      <Button
                        variant={selected ? 'dark' : 'outline-dark'}
                        onClick={(): void => toggleAnswer(idx)}
                      >
                        <Icon I={FaCheck} className={selected ? '' : 'invisible'} />
                      </Button>
                    </td>
                    <td className="w-100">
                      <CustomEditor
                        className="bg-white"
                        theme="bubble"
                        value={option}
                        onChange={(newPrompt): void => setPrompt(idx, newPrompt)}
                      />
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td />
                <td className="text-center">
                  <Button
                    variant="dark"
                    onClick={addOption}
                  >
                    Add new option
                  </Button>
                </td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Form.Group>
    </>
  );
};

export default AllThatApply;
