import React, { useState } from 'react';
import {
  Form,
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import {
  AllThatApplyInfo,
  AllThatApplyState,
  HTMLVal,
} from '@student/exams/show/types';
import Prompted from '@professor/exams/new/editor/components/questions/Prompted';
import CustomEditor from '@professor/exams/new/editor/components/CustomEditor';
import { FaCheck } from 'react-icons/fa';
import Icon from '@student/exams/show/components/Icon';
// import MoveItem from '@professor/exams/new/editor/containers/MoveItem';
import { UpdateBodyItemAction } from '@professor/exams/new/types';

interface AllThatApplyProps {
  info: AllThatApplyInfo;
  value: AllThatApplyState;
  onChange: (newInfo: AllThatApplyInfo, newVal: AllThatApplyState) => void;
  makeChangeAction: (newInfo: AllThatApplyInfo, newState: AllThatApplyState)
    => UpdateBodyItemAction;
  qnum: number;
  pnum: number;
  bnum: number;
}

function cutAndShiftDown(obj: AllThatApplyState, cutoff: number): AllThatApplyState {
  const ans = {};
  Object.keys(obj).forEach((key) => {
    if (Number(key) < cutoff) {
      ans[key] = obj[key];
    } else if (Number(key) === cutoff) {
      // do nothing, and delete the key
    } else {
      ans[Number(key) - 1] = obj[key];
    }
  });
  return ans;
}
function shiftUp(obj: AllThatApplyState, cutoff: number): AllThatApplyState {
  const ans = {};
  Object.keys(obj).forEach((key) => {
    if (Number(key) < cutoff) {
      ans[key] = obj[key];
    } else {
      ans[Number(key) + 1] = obj[key];
    }
  });
  return ans;
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
    newOptions.push({
      type: 'HTML',
      value: '',
    });
    onChange({ ...info, options: newOptions }, value);
  };
  const deleteOption = (index: number): UpdateBodyItemAction => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    const newValue = cutAndShiftDown(value, index);
    return makeChangeAction({ ...info, options: newOptions }, newValue);
  };
  const moveOption = (from: number, to: number): UpdateBodyItemAction => {
    const newOptions = [...options];
    const fromOpt = newOptions[from];
    newOptions.splice(from, 1);
    newOptions.splice(to, 0, fromOpt);
    const cutFromValue = cutAndShiftDown(value, from);
    const newValue = shiftUp(cutFromValue, to);
    newValue[to] = value[from];
    return makeChangeAction({ ...info, options: newOptions }, newValue);
  };
  return (
    <>
      <Prompted
        qnum={qnum}
        pnum={pnum}
        bnum={bnum}
        prompt={prompt.value}
        onChange={(newPrompt): void => {
          if (onChange) {
            onChange(
              {
                ...info,
                prompt: {
                  type: 'HTML',
                  value: newPrompt,
                },
              },
              value,
            );
          }
        }}
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
            const selected = value?.[idx];
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
                  {/* <MoveItem */}
                  {/*   visible={moversVisible[idx]} */}
                  {/*   variant="dark" */}
                  {/*   enableUp={idx > 0} */}
                  {/*   enableDown={idx + 1 < options.length} */}
                  {/*   onDelete={(): UpdateBodyItemAction => deleteOption(idx)} */}
                  {/*   onDown={(): UpdateBodyItemAction => moveOption(idx, idx + 1)} */}
                  {/*   onUp={(): UpdateBodyItemAction => moveOption(idx - 1, idx)} */}
                  {/* /> */}
                  <Button
                    variant={selected ? 'dark' : 'outline-dark'}
                    onClick={(): void => toggleAnswer(idx)}
                  >
                    <Icon I={FaCheck} className={selected ? '' : 'invisible'} />
                  </Button>
                </Col>
                <Col className="pr-0">
                  <CustomEditor
                    className="bg-white"
                    theme="bubble"
                    value={option.value}
                    onChange={(newPrompt): void => {
                      setPrompt(
                        idx,
                        {
                          type: 'HTML',
                          value: newPrompt,
                        },
                      );
                    }}
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

export default AllThatApply;
