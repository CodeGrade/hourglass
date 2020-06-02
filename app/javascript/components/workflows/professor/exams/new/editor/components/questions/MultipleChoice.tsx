import React, { useState } from 'react';
import {
  Row,
  Col,
  Form,
  Button,
} from 'react-bootstrap';
import { MultipleChoiceInfo, MultipleChoiceState, HTMLVal } from '@student/exams/show/types';
import Prompted from '@professor/exams/new/editor/components/questions/Prompted';
import CustomEditor from '@professor/exams/new/editor/components/CustomEditor';
import MoveItem from '@professor/exams/new/editor/containers/MoveItem';
import { FaCircle } from 'react-icons/fa';
import Icon from '@student/exams/show/components/Icon';
import { UpdateBodyItemAction } from '@professor/exams/new/types';
import './questions.scss';

interface MultipleChoiceProps {
  info: MultipleChoiceInfo;
  value: MultipleChoiceState;
  onChange: (newInfo: MultipleChoiceInfo, newVal: MultipleChoiceState) => void;
  makeChangeAction: (newInfo: MultipleChoiceInfo, newVal: MultipleChoiceState)
    => UpdateBodyItemAction;
  qnum: number;
  pnum: number;
  bnum: number;
}

const MultipleChoice: React.FC<MultipleChoiceProps> = (props) => {
  const {
    info,
    value,
    onChange,
    makeChangeAction,
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
  const setAnswer = (newVal): void => onChange(info, newVal);
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
    const newValue = (value >= index ? value - 1 : value);
    return makeChangeAction({ ...info, options: newOptions }, newValue);
  };
  const moveOption = (from: number, to: number): UpdateBodyItemAction => {
    // ASSUME from < to
    const newOptions = [...info.options];
    const fromOpt = newOptions[from];
    newOptions.splice(from, 1);
    newOptions.splice(to, 0, fromOpt);
    let newValue = value;
    if (value === from) {
      newValue = to;
    } else if (value === to) {
      newValue = to - 1;
    }
    return makeChangeAction({ ...info, options: newOptions }, newValue);
  };
  return (
    <>
      <Prompted
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
        prompt={prompt}
        onChange={(newPrompt): void => onChange({ ...info, prompt: newPrompt }, value)}
      />
      <Form.Group as={Row} controlId={`${qnum}-${pnum}-${bnum}-answer`}>
        <Form.Label column sm={2}>Answers</Form.Label>
        <Col sm={10}>
          <Row className="p-2">
            <Col className="flex-grow-01">
              <b>Correct?</b>
            </Col>
            <Col><b>Prompt</b></Col>
          </Row>
          {options.map((option, idx) => {
            const selected = (value === idx);
            return (
              <Row
                className="p-2"
                // We don't have a better option than this index right now.
                // eslint-disable-next-line react/no-array-index-key
                key={idx}
                onMouseOver={(): void => setMoversVisible(idx, true)}
                onFocus={(): void => setMoversVisible(idx, true)}
                onBlur={(): void => setMoversVisible(idx, false)}
                onMouseOut={(): void => setMoversVisible(idx, false)}
              >
                <Col className="flex-grow-01">
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
                    onClick={(): void => setAnswer(idx)}
                  >
                    <Icon I={FaCircle} className={selected ? '' : 'invisible'} />
                  </Button>
                </Col>
                <Col className="pr-0">
                  <CustomEditor
                    className="bg-white"
                    theme="bubble"
                    value={option}
                    onChange={(newPrompt): void => setPrompt(idx, newPrompt)}
                  />
                </Col>
              </Row>
            );
          })}
          <Row className="p-2">
            <Col className="text-center p-0">
              <Button
                variant="dark"
                onClick={addOption}
              >
                Add new option
              </Button>
            </Col>
          </Row>
        </Col>
      </Form.Group>
    </>
  );
};

export default MultipleChoice;
